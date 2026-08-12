from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from datetime import datetime, date
import uuid

from app.db.session import get_db
from app.db.models import PlanStep, Plan, Trajectory, JournalEntry, User
from app.schemas.all_schemas import DayRead, PlanStepWithTrajectoryRead, JournalEntryRead

router = APIRouter(prefix="/day", tags=["Day View"])

@router.get("/{date_str}", response_model=DayRead)
async def get_day_summary(
    date_str: str = Path(..., description="Date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db)
):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # 1. Fetch Normal Plan Steps scheduled for this date (non-templates)
    # We outerjoin Plan and Trajectory to get metadata, allowing unlinked tasks
    stmt_steps = (
        select(PlanStep, Trajectory)
        .outerjoin(Plan, PlanStep.plan_id == Plan.id)
        .outerjoin(Trajectory, Plan.trajectory_id == Trajectory.id)
        .where(PlanStep.scheduled_date == target_date)
    )
    res_steps = await db.execute(stmt_steps)
    
    tasks = []
    for step, traj in res_steps.all():
        tasks.append(
            PlanStepWithTrajectoryRead(
                id=step.id,
                plan_id=step.plan_id,
                title=step.title,
                detail=step.detail,
                week_label=step.week_label,
                step_order=step.step_order,
                is_done=step.is_done,
                status=step.status,
                scheduled_date=step.scheduled_date,
                start_time=step.start_time,
                end_time=step.end_time,
                completed_at=step.completed_at,
                trajectory_id=traj.id if traj else None,
                trajectory_title=traj.title if traj else None,
                trajectory_kind=traj.kind if traj else None,
                recurrence_rule=step.recurrence_rule,
                parent_step_id=step.parent_step_id
            )
        )

    # 1b. Fetch Recurring Templates and instantiate if needed
    stmt_templates = (
        select(PlanStep, Trajectory)
        .outerjoin(Plan, PlanStep.plan_id == Plan.id)
        .outerjoin(Trajectory, Plan.trajectory_id == Trajectory.id)
        .where(PlanStep.recurrence_rule.isnot(None))
        .where(PlanStep.scheduled_date.is_(None))
    )
    res_templates = await db.execute(stmt_templates)
    
    new_instances = []
    for template_step, traj in res_templates.all():
        rule = template_step.recurrence_rule
        should_instantiate = False
        
        if rule == "DAILY":
            should_instantiate = True
        elif rule and rule.startswith("WEEKLY:"):
            # WEEKLY:0,1,2,3,4 (0=Mon, 6=Sun)
            days = rule.split(":")[1].split(",")
            if str(target_date.weekday()) in days:
                should_instantiate = True
                
        if should_instantiate:
            # Check if instance already exists
            stmt_exists = select(PlanStep).where(
                PlanStep.parent_step_id == template_step.id,
                PlanStep.scheduled_date == target_date
            )
            exists = (await db.execute(stmt_exists)).scalar_one_or_none()
            
            if not exists:
                # Instantiate
                new_step = PlanStep(
                    id=uuid.uuid4(),
                    plan_id=template_step.plan_id,
                    title=template_step.title,
                    detail=template_step.detail,
                    week_label=template_step.week_label,
                    step_order=template_step.step_order,
                    status=template_step.status,
                    scheduled_date=target_date,
                    start_time=template_step.start_time,
                    end_time=template_step.end_time,
                    recurrence_rule=template_step.recurrence_rule,
                    parent_step_id=template_step.id
                )
                db.add(new_step)
                new_instances.append((new_step, traj))

    if new_instances:
        await db.commit()
        for new_step, traj in new_instances:
            tasks.append(
                PlanStepWithTrajectoryRead(
                    id=new_step.id,
                    plan_id=new_step.plan_id,
                    title=new_step.title,
                    detail=new_step.detail,
                    week_label=new_step.week_label,
                    step_order=new_step.step_order,
                    is_done=new_step.is_done,
                    status=new_step.status,
                    scheduled_date=new_step.scheduled_date,
                    start_time=new_step.start_time,
                    end_time=new_step.end_time,
                    completed_at=new_step.completed_at,
                    trajectory_id=traj.id if traj else None,
                    trajectory_title=traj.title if traj else None,
                    trajectory_kind=traj.kind if traj else None,
                    recurrence_rule=new_step.recurrence_rule,
                    parent_step_id=new_step.parent_step_id
                )
            )
    
    # 2. Fetch Journal Entries created on this date
    # Using between for cross-db compatibility
    start_dt = datetime.combine(target_date, datetime.min.time())
    end_dt = datetime.combine(target_date, datetime.max.time())
    
    stmt_journals = (
        select(JournalEntry)
        .where(JournalEntry.created_at >= start_dt)
        .where(JournalEntry.created_at <= end_dt)
    )
    res_journals = await db.execute(stmt_journals)
    journals = res_journals.scalars().all()
    
    return DayRead(
        date=target_date,
        tasks=tasks,
        journal_entries=[JournalEntryRead.model_validate(j) for j in journals]
    )
