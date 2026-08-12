from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.trajectory_service import get_or_create_default_user
from app.services.permission_service import PermissionService
from app.schemas.all_schemas import PermissionLogRead, PermissionActionRequest

router = APIRouter(prefix="/permissions", tags=["AI Permissions"])

@router.get("", response_model=List[PermissionLogRead])
async def list_pending_permissions(
    db: AsyncSession = Depends(get_db)
):
    user = await get_or_create_default_user(db)
    return await PermissionService.list_pending(db, user.id)

@router.post("/action", response_model=PermissionLogRead)
async def resolve_permission(
    data: PermissionActionRequest,
    db: AsyncSession = Depends(get_db)
):
    perm = await PermissionService.resolve_permission(db, data.permission_id, data.action)
    if not perm:
        raise HTTPException(status_code=404, detail="Permission log not found")
    return perm
