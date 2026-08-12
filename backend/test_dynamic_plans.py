import asyncio
import json
from app.db.session import use_sqlite_fallback, get_db
from app.services.trajectory_service import TrajectoryService, get_or_create_default_user
from app.services.plan_service import PlanService
from app.schemas.all_schemas import TrajectoryCreate
from app.db.models import PlanMode

async def test_dynamic_plans():
    use_sqlite_fallback()
    from app.db.session import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        user = await get_or_create_default_user(db)

        # 1. Swing Trading Trajectory
        t1_data = TrajectoryCreate(
            title="Stock Markets & Swing Trading",
            kind="money",
            goal="Master technical analysis & quarterly earnings setups for swing trading"
        )
        t1 = await TrajectoryService.create(db, user.id, t1_data)
        plan1 = await PlanService.generate_plan(db, t1, mode=PlanMode.BALANCED)
        print("\n--- Plan 1: Stock Markets (Balanced) ---")
        for s in plan1.steps:
            print(f"[{s.week_label}] {s.title} -> {s.detail}")

        # 2. Japan Trip Trajectory
        t2_data = TrajectoryCreate(
            title="Solo Japan Trip 2026",
            kind="travel",
            goal="Plan 7-day Tokyo & Kyoto itinerary under $3000 budget"
        )
        t2 = await TrajectoryService.create(db, user.id, t2_data)
        plan2 = await PlanService.generate_plan(db, t2, mode=PlanMode.LIGHTER)
        print("\n--- Plan 2: Japan Trip (Lighter) ---")
        for s in plan2.steps:
            print(f"[{s.week_label}] {s.title} -> {s.detail}")

        # 3. Rust Engine Trajectory
        t3_data = TrajectoryCreate(
            title="Rust High Performance Engine",
            kind="creative",
            goal="Build zero-allocation lock-free orderbook prototype"
        )
        t3 = await TrajectoryService.create(db, user.id, t3_data)
        plan3 = await PlanService.generate_plan(db, t3, mode=PlanMode.INTENSE)
        print("\n--- Plan 3: Rust Engine (Intense) ---")
        for s in plan3.steps:
            print(f"[{s.week_label}] {s.title} -> {s.detail}")

if __name__ == "__main__":
    asyncio.run(test_dynamic_plans())
