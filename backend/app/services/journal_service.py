import uuid
import json
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import JournalEntry, Trajectory, AIPermissionLog, PermissionStatus
from app.schemas.all_schemas import JournalEntryCreate, JournalAnalysisResponse
from app.ai.router import ai_router

class JournalService:
    @staticmethod
    async def create_and_analyze(db: AsyncSession, user_id: uuid.UUID, data: JournalEntryCreate) -> JournalAnalysisResponse:
        entry = JournalEntry(
            user_id=user_id,
            text=data.text,
            ai_read="Analyzing...",
            linked_trajectory_ids=[]
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)

        # Get existing trajectories for context
        stmt_traj = select(Trajectory).where(Trajectory.user_id == user_id, Trajectory.archived_at.is_(None))
        res_traj = await db.execute(stmt_traj)
        trajectories = list(res_traj.scalars().all())
        traj_info = [{"id": str(t.id), "title": t.title, "kind": t.kind.value} for t in trajectories]

        system_prompt = (
            "You are Jarvis Journal Pattern Analyzer. Read daily reflections without judgment. "
            "Identify patterns, link relevant active trajectories, and propose lightweight plan refactors if needed."
        )
        prompt = (
            f"User Journal Entry:\n\"{data.text}\"\n\n"
            f"Available Trajectories:\n{json.dumps(traj_info)}\n\n"
            "Respond in JSON format with keys:\n"
            "- 'ai_read': (string) insightful 2-sentence pattern synthesis\n"
            "- 'linked_trajectory_ids': (array of string UUIDs matching referenced trajectories)\n"
            "- 'proposed_refactor': (optional object with 'trajectory_id', 'mode', 'proposal_text') if plan adjustments recommended"
        )

        try:
            llm_res = await ai_router.generate_for_task(
                task_name="journal_analysis",
                prompt=prompt,
                system_prompt=system_prompt,
                response_format={"type": "json_object"}
            )
            analysis = json.loads(llm_res.content)
            ai_read = analysis.get("ai_read", "Entry recorded. Continuity active.")
            linked_ids = analysis.get("linked_trajectory_ids", [])
            proposed = analysis.get("proposed_refactor")
        except Exception:
            ai_read = "Entry captured. Jarvis keeps your context alive across days."
            linked_ids = [str(t.id) for t in trajectories[:1]]
            proposed = None

        # Generate embedding for vector search
        try:
            vector = await ai_router.embeddings.embed_query(data.text)
            entry.embedding = vector
        except Exception:
            pass

        entry.ai_read = ai_read
        entry.linked_trajectory_ids = linked_ids
        await db.commit()

        permission_dict = None
        if proposed and isinstance(proposed, dict) and proposed.get("proposal_text"):
            perm_log = AIPermissionLog(
                user_id=user_id,
                proposal=proposed["proposal_text"],
                affected_trajectory_ids=[proposed.get("trajectory_id")] if proposed.get("trajectory_id") else linked_ids,
                status=PermissionStatus.PENDING
            )
            db.add(perm_log)
            await db.commit()
            await db.refresh(perm_log)
            permission_dict = {
                "id": str(perm_log.id),
                "proposal": perm_log.proposal,
                "status": perm_log.status.value,
                "affected_trajectory_ids": perm_log.affected_trajectory_ids
            }

        return JournalAnalysisResponse(
            journal_id=entry.id,
            ai_read=ai_read,
            linked_trajectory_ids=linked_ids,
            proposed_permission=permission_dict
        )

    @staticmethod
    async def list_recent(db: AsyncSession, user_id: uuid.UUID, limit: int = 20) -> List[JournalEntry]:
        stmt = select(JournalEntry).where(JournalEntry.user_id == user_id).order_by(JournalEntry.created_at.desc()).limit(limit)
        res = await db.execute(stmt)
        return list(res.scalars().all())
