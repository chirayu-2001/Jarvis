import uuid
from typing import List, AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.models import User, ChatThread, ChatMessage, Trajectory, Plan
from app.schemas.all_schemas import ChatRequest, ChatResponse, ChatThreadRead
from app.ai.router import ai_router
from app.ai.harness import AgentHarness
import json
import uuid

class ChatService:
    @staticmethod
    async def get_or_create_thread(db: AsyncSession, trajectory_id: Optional[uuid.UUID] = None) -> ChatThread:
        # Default mock user
        user = (await db.execute(select(User))).scalars().first()
        
        stmt = select(ChatThread).where(ChatThread.user_id == user.id)
        if trajectory_id:
            stmt = stmt.where(ChatThread.trajectory_id == trajectory_id)
        else:
            stmt = stmt.where(ChatThread.trajectory_id == None)
            
        thread = (await db.execute(stmt)).scalars().first()
        
        if not thread:
            thread = ChatThread(
                user_id=user.id,
                trajectory_id=trajectory_id,
                context_mode="trajectory" if trajectory_id else "global"
            )
            db.add(thread)
            await db.commit()
            await db.refresh(thread)
            
        return thread

    @staticmethod
    async def get_thread(db: AsyncSession, trajectory_id: Optional[uuid.UUID] = None) -> ChatThreadRead:
        thread = await ChatService.get_or_create_thread(db, trajectory_id)
        return ChatThreadRead.model_validate(thread)

    @staticmethod
    async def _build_system_prompt(db: AsyncSession, thread: ChatThread, context_page: str) -> str:
        base_prompt = "You are Jarvis, a calm, highly capable side-brain AI assistant. Style: Conciseness, high editorial elegance, encouraging momentum without corporate shame.\n\n"
        
        if thread.trajectory_id:
            # Trajectory Context
            traj = await db.get(Trajectory, thread.trajectory_id)
            if traj:
                base_prompt += f"Active Context: Working on trajectory '{traj.title}'.\n"
                base_prompt += f"Goal: {traj.goal}\n"
                base_prompt += f"Standing: {traj.standing}\n"
                
                plan_stmt = select(Plan).where(Plan.trajectory_id == traj.id, Plan.is_active == True)
                plan = (await db.execute(plan_stmt)).scalars().first()
                if plan and plan.steps:
                    base_prompt += "Active Plan Steps:\n"
                    for step in sorted(plan.steps, key=lambda s: s.step_order):
                        done = "DONE" if step.is_done else "TODO"
                        base_prompt += f"- [{done}] {step.title}: {step.detail}\n"
        else:
            # Global Context
            base_prompt += f"Active Context: Global overview ({context_page}).\n"
            trajectories = (await db.execute(select(Trajectory).where(Trajectory.user_id == thread.user_id))).scalars().all()
            if trajectories:
                base_prompt += "Active Trajectories:\n"
                for t in trajectories:
                    base_prompt += f"- {t.title}: {t.standing}\n"
            else:
                base_prompt += "No active trajectories currently.\n"
                
        return base_prompt

    @staticmethod
    async def chat(db: AsyncSession, request: ChatRequest) -> ChatResponse:
        thread = await ChatService.get_or_create_thread(db, request.trajectory_id)
        
        user_text = request.messages[-1].content if request.messages else "Hello"
        
        new_msg = ChatMessage(thread_id=thread.id, role="user", content=user_text)
        db.add(new_msg)
        await db.commit()
        
        system_prompt = await ChatService._build_system_prompt(db, thread, request.context_page or 'Dashboard')
        
        await db.refresh(thread)
        llm_messages = [{"role": "system", "content": system_prompt}]
        for m in sorted(thread.messages, key=lambda x: x.created_at):
            llm_messages.append({"role": m.role, "content": m.content})
            
        llm_res = await ai_router.generate_for_task(
            task_name="chat",
            messages=llm_messages,
            temperature=0.7
        )
        
        ai_msg = ChatMessage(thread_id=thread.id, role="assistant", content=llm_res.content)
        db.add(ai_msg)
        await db.commit()

        return ChatResponse(
            reply=llm_res.content,
            suggested_actions=[]
        )

    @staticmethod
    async def chat_stream(db: AsyncSession, request: ChatRequest) -> AsyncGenerator[str, None]:
        thread = await ChatService.get_or_create_thread(db, request.trajectory_id)
        
        user_text = request.messages[-1].content if request.messages else "Hello"
        new_msg = ChatMessage(thread_id=thread.id, role="user", content=user_text)
        db.add(new_msg)
        await db.commit()
        await db.refresh(thread)
        
        if request.trajectory_id:
            # Trajectory Context -> Agent Harness
            traj = await db.get(Trajectory, request.trajectory_id)
            harness = AgentHarness(trajectory=traj, thread=thread)
            
            full_response = ""
            async for event in harness.run():
                event_type = event.get("type")
                event_content = event.get("content")
                
                if event_type == "plan_data":
                    # Save plan to db (similar to PlanService)
                    from app.services.plan_service import PlanService, PlanMode
                    steps_data = event_content.get("steps", [])
                    widgets = event_content.get("widgets", [])
                    
                    if not steps_data:
                        from app.services.plan_service import generate_dynamic_steps
                        steps_data = generate_dynamic_steps(traj.title, traj.goal, str(traj.kind), PlanMode.BALANCED)
                        
                    # Deactivate old plans
                    from sqlalchemy import update
                    await db.execute(update(Plan).where(Plan.trajectory_id == traj.id).values(is_active=False))
                    
                    plan_id = uuid.uuid4()
                    plan = Plan(id=plan_id, trajectory_id=traj.id, mode=PlanMode.BALANCED, goal_snapshot=traj.goal or traj.title, is_active=True)
                    db.add(plan)
                    
                    if widgets:
                        current_meta = traj.extra_metadata or {}
                        current_meta["dynamic_widgets"] = widgets
                        traj.extra_metadata = current_meta
                        db.add(traj)
                        
                    await db.flush()
                    
                    from app.db.models import PlanStep
                    for idx, step in enumerate(steps_data, start=1):
                        db.add(PlanStep(
                            id=uuid.uuid4(), plan_id=plan_id,
                            title=step.get("title", f"Step {idx}"), detail=step.get("detail"),
                            week_label=step.get("week_label", f"Week {idx}"), step_order=step.get("step_order", idx)
                        ))
                    
                    await db.commit()
                    
                    plan_result_msg = "Plan finalized and saved successfully. Dynamic widgets injected."
                    full_response += f"\n<tool_result>{plan_result_msg}</tool_result>"
                    yield f"data: {json.dumps({'type': 'tool_result', 'content': plan_result_msg})}\n\n"
                    yield f"data: {json.dumps({'type': 'action', 'action': 'refresh_plan'})}\n\n"
                    
                else:
                    if event_type == "thought":
                        full_response += f"\n<thought>{event_content}</thought>"
                    elif event_type == "tool_call":
                        full_response += f"\n<tool_call>{event_content}</tool_call>"
                    elif event_type == "tool_result":
                        full_response += f"\n<tool_result>{event_content}</tool_result>"
                    elif event_type == "message":
                        full_response += f"\n{event_content}"
                        
                    yield f"data: {json.dumps(event)}\n\n"
                    
            ai_msg = ChatMessage(thread_id=thread.id, role="assistant", content=full_response.strip())
            db.add(ai_msg)
            await db.commit()
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        else:
            # Global Context -> Standard Streaming
            system_prompt = await ChatService._build_system_prompt(db, thread, request.context_page or 'Dashboard')
            llm_messages = [{"role": "system", "content": system_prompt}]
            for m in sorted(thread.messages, key=lambda x: x.created_at):
                llm_messages.append({"role": m.role, "content": m.content})
                
            full_response = ""
            async for chunk in ai_router.generate_stream_for_task(
                task_name="chat",
                messages=llm_messages,
                temperature=0.7
            ):
                full_response += chunk
                yield f"data: {json.dumps({'type': 'message', 'content': chunk})}\n\n"
                
            ai_msg = ChatMessage(thread_id=thread.id, role="assistant", content=full_response)
            db.add(ai_msg)
            await db.commit()
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
