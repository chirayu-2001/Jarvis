import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AIPermissionLog, PermissionStatus
from app.schemas.all_schemas import PermissionActionRequest

class PermissionService:
    @staticmethod
    async def list_pending(db: AsyncSession, user_id: uuid.UUID) -> List[AIPermissionLog]:
        stmt = select(AIPermissionLog).where(
            AIPermissionLog.user_id == user_id,
            AIPermissionLog.status == PermissionStatus.PENDING
        ).order_by(AIPermissionLog.created_at.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def resolve_permission(db: AsyncSession, permission_id: uuid.UUID, action: str) -> Optional[AIPermissionLog]:
        stmt = select(AIPermissionLog).where(AIPermissionLog.id == permission_id)
        res = await db.execute(stmt)
        perm = res.scalar_one_or_none()
        if not perm:
            return None

        if action.lower() == "approve":
            perm.status = PermissionStatus.APPROVED
        else:
            perm.status = PermissionStatus.REJECTED

        perm.resolved_at = datetime.utcnow()
        await db.commit()
        await db.refresh(perm)
        return perm
