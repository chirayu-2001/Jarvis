import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings

def create_engine_and_session(db_url: str):
    is_sqlite = db_url.startswith("sqlite")
    connect_args = {"check_same_thread": False} if is_sqlite else {}
    eng = create_async_engine(
        db_url,
        echo=False,
        future=True,
        pool_pre_ping=True,
        connect_args=connect_args
    )
    sm = async_sessionmaker(
        eng,
        class_=AsyncSession,
        expire_on_commit=False
    )
    return eng, sm

# Try primary DB URL from settings
engine, AsyncSessionLocal = create_engine_and_session(settings.async_database_url)

def use_sqlite_fallback():
    global engine, AsyncSessionLocal
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    db_path = os.path.join(base_dir, "jarvis_dev.db")
    fallback_url = f"sqlite+aiosqlite:///{db_path}"
    print(f"[Jarvis Backend] Initializing SQLite fallback engine at {fallback_url}")
    engine, AsyncSessionLocal = create_engine_and_session(fallback_url)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
