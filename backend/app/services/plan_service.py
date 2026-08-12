import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any, AsyncGenerator
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Plan, PlanStep, PlanMode, Trajectory, TaskStatus
from app.schemas.all_schemas import PlanCreate, PlanRefactorRequest, PlanStepUpdate, PlanStepCreate
from app.ai.harness import AgentHarness
import asyncio

def generate_dynamic_steps(title: str, goal: Optional[str], kind: str, mode: PlanMode) -> List[Dict[str, Any]]:
    # When LLM fails, we shouldn't pretend it succeeded with generic steps.
    # Return a clear fallback that tells the user the connection failed.
    return [
        {
            "title": "AI Connection Offline",
            "detail": "Failed to connect to the active LLM to generate a deep-researched plan. Please ensure your LLM provider is active or API keys are set in the .env file.",
            "week_label": "Error",
            "step_order": 1
        },
        {
            "title": f"Manual Planning for {title}",
            "detail": f"Since the AI is offline, you can manually break down the goal '{goal or title}' into your own actionable steps here.",
            "week_label": "Manual",
            "step_order": 2
        }
    ]

class PlanService:
    @staticmethod
    async def generate_plan_stream(db: AsyncSession, trajectory: Trajectory, mode: PlanMode = PlanMode.BALANCED) -> AsyncGenerator[str, None]:
        goal_text = trajectory.goal or trajectory.title
        harness = AgentHarness(trajectory, goal_text)
        
        steps_data = []
        widgets = []
        
        async for event in harness.run():
            event_type = event.get("type")
            event_content = event.get("content")
            
            if event_type == "plan_data":
                steps_data = event_content.get("steps", [])
                widgets = event_content.get("widgets", [])
                break
            else:
                yield f"data: {json.dumps(event)}\n\n"
                
        # If no valid steps, fallback
        if not steps_data or not isinstance(steps_data, list) or len(steps_data) == 0:
            steps_data = generate_dynamic_steps(
                title=trajectory.title,
                goal=trajectory.goal,
                kind=str(trajectory.kind),
                mode=mode
            )

        # Deactivate any previous plans for this trajectory
        stmt = update(Plan).where(Plan.trajectory_id == trajectory.id).values(is_active=False)
        await db.execute(stmt)

        plan_id = uuid.uuid4()
        plan = Plan(
            id=plan_id,
            trajectory_id=trajectory.id,
            mode=mode,
            goal_snapshot=goal_text,
            is_active=True
        )
        db.add(plan)
        
        # Save dynamic widgets to trajectory
        if widgets:
            current_meta = trajectory.extra_metadata or {}
            current_meta["dynamic_widgets"] = widgets
            trajectory.extra_metadata = current_meta
            db.add(trajectory)

        await db.flush()

        for idx, step in enumerate(steps_data, start=1):
            if not isinstance(step, dict):
                continue
            
            scheduled_date_str = step.get("scheduled_date")
            scheduled_date = None
            if scheduled_date_str:
                try:
                    scheduled_date = datetime.strptime(scheduled_date_str, "%Y-%m-%d").date()
                except ValueError:
                    pass

            plan_step = PlanStep(
                id=uuid.uuid4(),
                plan_id=plan_id,
                title=step.get("title", f"Step {idx} for {trajectory.title}"),
                detail=step.get("detail"),
                week_label=step.get("week_label", f"Week {idx}"),
                step_order=step.get("step_order", idx),
                scheduled_date=scheduled_date
            )
            db.add(plan_step)

        await db.commit()
        
        # Send final success event
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    @staticmethod
    async def get_active_plan(db: AsyncSession, trajectory_id: uuid.UUID) -> Optional[Plan]:
        stmt = select(Plan).options(selectinload(Plan.steps)).where(Plan.trajectory_id == trajectory_id, Plan.is_active.is_(True)).limit(1)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def toggle_step(db: AsyncSession, step_id: uuid.UUID) -> Optional[PlanStep]:
        stmt = select(PlanStep).where(PlanStep.id == step_id)
        res = await db.execute(stmt)
        step = res.scalar_one_or_none()
        if not step:
            return None

        step.is_done = not step.is_done
        step.status = TaskStatus.DONE if step.is_done else TaskStatus.TODO
        step.completed_at = datetime.utcnow() if step.is_done else None

        # Update trajectory momentum on step completion
        stmt_plan = select(Plan).where(Plan.id == step.plan_id)
        res_plan = await db.execute(stmt_plan)
        plan = res_plan.scalar_one_or_none()
        if plan:
            stmt_traj = select(Trajectory).where(Trajectory.id == plan.trajectory_id)
            res_traj = await db.execute(stmt_traj)
            traj = res_traj.scalar_one_or_none()
            if traj:
                traj.momentum = min(1.0, traj.momentum + 0.15) if step.is_done else max(0.1, traj.momentum - 0.1)
                traj.last_touched = datetime.utcnow()

        await db.commit()
        await db.refresh(step)
        return step

    @staticmethod
    async def update_step(db: AsyncSession, step_id: uuid.UUID, data: PlanStepUpdate) -> Optional[PlanStep]:
        stmt = select(PlanStep).where(PlanStep.id == step_id)
        res = await db.execute(stmt)
        step = res.scalar_one_or_none()
        if not step:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(step, key, value)
            
        if "status" in update_data:
            if update_data["status"] == TaskStatus.DONE and not step.is_done:
                step.is_done = True
                step.completed_at = datetime.utcnow()
            elif update_data["status"] != TaskStatus.DONE and step.is_done:
                step.is_done = False
                step.completed_at = None
                
        await db.commit()
        await db.refresh(step)
        return step

    @staticmethod
    async def create_manual_step(db: AsyncSession, data: PlanStepCreate) -> Optional[PlanStep]:
        plan = None
        if data.trajectory_id:
            stmt = select(Plan).where(Plan.trajectory_id == data.trajectory_id, Plan.is_active.is_(True)).limit(1)
            res = await db.execute(stmt)
            plan = res.scalar_one_or_none()
            
            if not plan:
                plan_id = uuid.uuid4()
                plan = Plan(
                    id=plan_id,
                    trajectory_id=data.trajectory_id,
                    mode=PlanMode.BALANCED,
                    goal_snapshot="Manual Plan",
                    is_active=True
                )
                db.add(plan)
                await db.flush()

        if data.recurrence_rule:
            # Create a single template step
            plan_step = PlanStep(
                id=uuid.uuid4(),
                plan_id=plan.id if plan else None,
                title=data.title,
                detail=data.detail,
                week_label="Recurring Template",
                step_order=999,
                status=data.status,
                scheduled_date=None,
                start_time=data.start_time,
                end_time=data.end_time,
                recurrence_rule=data.recurrence_rule
            )
            db.add(plan_step)
            first_step = plan_step
        else:
            dates_to_schedule = data.scheduled_dates if data.scheduled_dates else []
            if not dates_to_schedule and data.scheduled_date:
                dates_to_schedule = [data.scheduled_date]
            if not dates_to_schedule:
                dates_to_schedule = [None]
                
            for d in dates_to_schedule:
                plan_step = PlanStep(
                    id=uuid.uuid4(),
                    plan_id=plan.id if plan else None,
                    title=data.title,
                    detail=data.detail,
                    week_label="Manual",
                    step_order=999,
                    status=data.status,
                    scheduled_date=d,
                    start_time=data.start_time,
                    end_time=data.end_time
                )
                db.add(plan_step)
                if not first_step:
                    first_step = plan_step
                
        await db.commit()
        if first_step:
            await db.refresh(first_step)
        return first_step
