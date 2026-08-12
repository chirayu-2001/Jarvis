from fastapi import APIRouter
from app.api.v1.trajectories import router as trajectories_router
from app.api.v1.plans import router as plans_router
from app.api.v1.journal import router as journal_router
from app.api.v1.permissions import router as permissions_router
from app.api.v1.chat import router as chat_router
from app.api.v1.health import router as health_router
from app.api.v1.day import router as day_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(trajectories_router)
api_v1_router.include_router(plans_router)
api_v1_router.include_router(journal_router)
api_v1_router.include_router(permissions_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(day_router)
