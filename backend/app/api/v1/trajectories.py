from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.trajectory_service import TrajectoryService, get_or_create_default_user
from app.services.plan_service import PlanService
from app.schemas.all_schemas import TrajectoryCreate, TrajectoryUpdate, TrajectoryRead, TrajectoryDetailRead, PlanRead
from app.db.models import TrajectoryStatus

router = APIRouter(prefix="/trajectories", tags=["Trajectories"])

@router.post("", response_model=TrajectoryRead, status_code=status.HTTP_201_CREATED)
async def create_trajectory(
    data: TrajectoryCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await get_or_create_default_user(db)
    trajectory = await TrajectoryService.create(db, user.id, data)
    return trajectory

@router.get("", response_model=List[TrajectoryRead])
async def list_trajectories(
    status: Optional[TrajectoryStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    user = await get_or_create_default_user(db)
    return await TrajectoryService.list_all(db, user.id, status=status)

@router.get("/{trajectory_id}", response_model=TrajectoryDetailRead)
async def get_trajectory_detail(
    trajectory_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    trajectory = await TrajectoryService.get_by_id(db, trajectory_id)
    if not trajectory:
        raise HTTPException(status_code=404, detail="Trajectory not found")

    active_plan = await PlanService.get_active_plan(db, trajectory_id)
    plan_read = None
    if active_plan:
        plan_read = PlanRead.model_validate(active_plan)

    return TrajectoryDetailRead(
        id=trajectory.id,
        user_id=trajectory.user_id,
        title=trajectory.title,
        kind=trajectory.kind,
        status=trajectory.status,
        subtitle=trajectory.subtitle,
        photo_url=trajectory.photo_url,
        standing=trajectory.standing,
        current_state=trajectory.current_state,
        goal=trajectory.goal,
        momentum=trajectory.momentum,
        last_touched=trajectory.last_touched,
        created_at=trajectory.created_at,
        updated_at=trajectory.updated_at,
        archived_at=trajectory.archived_at,
        extra_metadata=trajectory.extra_metadata or {},
        active_plan=plan_read,
        recent_events_count=0
    )

@router.patch("/{trajectory_id}", response_model=TrajectoryRead)
async def update_trajectory(
    trajectory_id: UUID,
    data: TrajectoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    updated = await TrajectoryService.update(db, trajectory_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Trajectory not found")
    return updated

@router.delete("/{trajectory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trajectory(
    trajectory_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    success = await TrajectoryService.delete(db, trajectory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trajectory not found")
