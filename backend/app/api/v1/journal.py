from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.trajectory_service import get_or_create_default_user
from app.services.journal_service import JournalService
from app.schemas.all_schemas import JournalEntryCreate, JournalEntryRead, JournalAnalysisResponse

router = APIRouter(prefix="/journal", tags=["Journal"])

@router.post("", response_model=JournalAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    data: JournalEntryCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await get_or_create_default_user(db)
    return await JournalService.create_and_analyze(db, user.id, data)

@router.get("", response_model=List[JournalEntryRead])
async def list_journal_entries(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    user = await get_or_create_default_user(db)
    return await JournalService.list_recent(db, user.id, limit=limit)
