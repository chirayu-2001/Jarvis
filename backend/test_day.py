import asyncio
import os
from datetime import datetime
from app.db.session import AsyncSessionLocal
from sqlalchemy import select
from app.db.models import PlanStep, Plan, Trajectory, JournalEntry

async def test():
    async with AsyncSessionLocal() as db:
        target_date = datetime.strptime("2026-08-12", "%Y-%m-%d").date()
        stmt_steps = (
            select(PlanStep, Trajectory)
            .join(Plan, PlanStep.plan_id == Plan.id)
            .join(Trajectory, Plan.trajectory_id == Trajectory.id)
            .where(PlanStep.scheduled_date == target_date)
        )
        res_steps = await db.execute(stmt_steps)
        print("Steps:", res_steps.all())

asyncio.run(test())
