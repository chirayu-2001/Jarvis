from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.trajectory_service import TrajectoryService
from app.services.plan_service import PlanService
from app.schemas.all_schemas import (
    PlanCreate, PlanRefactorRequest, PlanRead, PlanStepToggleResponse
)

from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/plans", tags=["Plans"])

@router.post("/generate")
async def generate_plan(
    data: PlanCreate,
    db: AsyncSession = Depends(get_db)
):
    trajectory = await TrajectoryService.get_by_id(db, data.trajectory_id)
    if not trajectory:
        raise HTTPException(status_code=404, detail="Trajectory not found")

    return StreamingResponse(
        PlanService.generate_plan_stream(db, trajectory, mode=data.mode),
        media_type="text/event-stream"
    )

@router.post("/refactor")
async def refactor_plan(
    data: PlanRefactorRequest,
    db: AsyncSession = Depends(get_db)
):
    trajectory = await TrajectoryService.get_by_id(db, data.trajectory_id)
    if not trajectory:
        raise HTTPException(status_code=404, detail="Trajectory not found")

    return StreamingResponse(
        PlanService.generate_plan_stream(db, trajectory, mode=data.target_mode),
        media_type="text/event-stream"
    )

@router.post("/step/{step_id}/toggle", response_model=PlanStepToggleResponse)
async def toggle_step(
    step_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    step = await PlanService.toggle_step(db, step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Plan step not found")
    return PlanStepToggleResponse(
        step_id=step.id,
        is_done=step.is_done,
        completed_at=step.completed_at
    )
