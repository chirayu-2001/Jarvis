import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Trajectory, TrajectoryStatus, TrajectoryKind, User
from app.schemas.all_schemas import TrajectoryCreate, TrajectoryUpdate

async def get_or_create_default_user(db: AsyncSession) -> User:
    stmt = select(User).limit(1)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        user = User(
            email="chiraayud@gmail.com",
            name="Chirayu Gupta",
            preferences={"theme": "dark", "editorial": True}
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

class TrajectoryService:
    @staticmethod
    async def create(db: AsyncSession, user_id: uuid.UUID, data: TrajectoryCreate) -> Trajectory:
        trajectory = Trajectory(
            user_id=user_id,
            title=data.title,
            kind=data.kind,
            subtitle=data.subtitle,
            photo_url=data.photo_url,
            goal=data.goal,
            standing=f"Fresh signal: {data.title}",
            status=TrajectoryStatus.NEW,
            momentum=0.5
        )
        db.add(trajectory)
        await db.commit()
        await db.refresh(trajectory)
        return trajectory

    @staticmethod
    async def list_all(db: AsyncSession, user_id: uuid.UUID, status: Optional[TrajectoryStatus] = None) -> List[Trajectory]:
        stmt = select(Trajectory).where(Trajectory.user_id == user_id, Trajectory.archived_at.is_(None))
        if status:
            stmt = stmt.where(Trajectory.status == status)
        stmt = stmt.order_by(Trajectory.momentum.desc(), Trajectory.last_touched.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, trajectory_id: uuid.UUID) -> Optional[Trajectory]:
        stmt = select(Trajectory).where(Trajectory.id == trajectory_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def update(db: AsyncSession, trajectory_id: uuid.UUID, data: TrajectoryUpdate) -> Optional[Trajectory]:
        trajectory = await TrajectoryService.get_by_id(db, trajectory_id)
        if not trajectory:
            return None

        update_data = data.model_dump(exclude_unset=True)
        if update_data:
            for key, value in update_data.items():
                setattr(trajectory, key, value)
            trajectory.last_touched = datetime.utcnow()
            await db.commit()
            await db.refresh(trajectory)
        return trajectory

    @staticmethod
    async def archive(db: AsyncSession, trajectory_id: uuid.UUID) -> bool:
        trajectory = await TrajectoryService.get_by_id(db, trajectory_id)
        if not trajectory:
            return False
        trajectory.archived_at = datetime.utcnow()
        await db.commit()
        return True

    @staticmethod
    async def delete(db: AsyncSession, trajectory_id: uuid.UUID) -> bool:
        trajectory = await TrajectoryService.get_by_id(db, trajectory_id)
        if not trajectory:
            return False
        await db.delete(trajectory)
        await db.commit()
        return True
