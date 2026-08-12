from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import api_v1_router
from app.db.session import engine, use_sqlite_fallback, get_db
from app.db.base import Base
import app.db.models  # Ensure models are imported

@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print(f"[Jarvis Backend] Connected successfully to primary database.")
    except Exception as e:
        print(f"[Jarvis Backend] PostgreSQL unavailable ({type(e).__name__}). Switching to SQLite fallback...")
        use_sqlite_fallback()
        from app.db.session import engine as fallback_engine
        async with fallback_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print(f"[Jarvis Backend] SQLite fallback database initialized successfully.")
    yield
    from app.db.session import engine as current_engine
    await current_engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Jarvis Personal OS API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
