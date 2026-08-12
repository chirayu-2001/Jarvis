from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.schemas.all_schemas import ChatRequest, ChatResponse, ChatThreadRead
from app.services.chat_service import ChatService
from app.db.session import get_db

router = APIRouter(prefix="/chat", tags=["Jarvis Chat"])

@router.get("/thread", response_model=ChatThreadRead)
async def get_chat_thread_endpoint(trajectory_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    return await ChatService.get_thread(db, trajectory_id)

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    return await ChatService.chat(db, request)

@router.post("/stream")
async def chat_stream_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    return StreamingResponse(
        ChatService.chat_stream(db, request),
        media_type="text/event-stream"
    )
