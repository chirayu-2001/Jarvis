import asyncio
from sqlalchemy import text
from app.db.session import use_sqlite_fallback, get_db

async def clear_db():
    print("[Jarvis DB Cleanup] Activating SQLite fallback engine...")
    use_sqlite_fallback()
    from app.db.session import engine
    print("[Jarvis DB Cleanup] Deleting all records from database...")
    async with engine.begin() as conn:
        await conn.execute(text("DELETE FROM plan_steps;"))
        await conn.execute(text("DELETE FROM plans;"))
        await conn.execute(text("DELETE FROM journey_events;"))
        await conn.execute(text("DELETE FROM resources;"))
        await conn.execute(text("DELETE FROM journal_entries;"))
        await conn.execute(text("DELETE FROM reflections;"))
        await conn.execute(text("DELETE FROM ai_permission_logs;"))
        await conn.execute(text("DELETE FROM trajectories;"))
        await conn.execute(text("DELETE FROM users;"))
    print("[Jarvis DB Cleanup] Database successfully cleared!")

if __name__ == "__main__":
    asyncio.run(clear_db())
