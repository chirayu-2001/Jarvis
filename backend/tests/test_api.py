import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["project"] == "Jarvis Personal OS"

@pytest.mark.asyncio
async def test_trajectory_crud_flow(client: AsyncClient):
    # 1. Create Trajectory
    payload = {
        "title": "Build Jarvis AI OS",
        "kind": "creative",
        "subtitle": "Personal OS MVP",
        "goal": "Build model-agnostic backend & editorial frontend"
    }
    res = await client.post("/api/v1/trajectories", json=payload)
    assert res.status_code == 201
    traj_data = res.json()
    traj_id = traj_data["id"]
    assert traj_data["title"] == "Build Jarvis AI OS"
    assert traj_data["kind"] == "creative"
    assert traj_data["momentum"] == 0.5

    # 2. List Trajectories
    res_list = await client.get("/api/v1/trajectories")
    assert res_list.status_code == 200
    trajectories = res_list.json()
    assert len(trajectories) == 1
    assert trajectories[0]["id"] == traj_id

    # 3. Get Detail with active auto-generated plan
    res_detail = await client.get(f"/api/v1/trajectories/{traj_id}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["active_plan"] is not None
    assert len(detail["active_plan"]["steps"]) > 0

    # 4. Toggle plan step completion
    first_step_id = detail["active_plan"]["steps"][0]["id"]
    res_toggle = await client.post(f"/api/v1/plans/step/{first_step_id}/toggle")
    assert res_toggle.status_code == 200
    assert res_toggle.json()["is_done"] is True

    # 5. Check momentum increase on trajectory
    res_updated_detail = await client.get(f"/api/v1/trajectories/{traj_id}")
    assert res_updated_detail.json()["momentum"] > 0.5

@pytest.mark.asyncio
async def test_journal_entry_analysis_and_permission(client: AsyncClient):
    # First create a trajectory
    await client.post("/api/v1/trajectories", json={
        "title": "Quantum Computing Study",
        "kind": "learning"
    })

    # Submit Journal Entry
    journal_payload = {
        "text": "Feeling overwhelmed with quantum mechanics math today. I need to shrink my steps to 1 week lighter tasks."
    }
    res = await client.post("/api/v1/journal", json=journal_payload)
    assert res.status_code == 201
    data = res.json()
    assert "journal_id" in data
    assert data["ai_read"] != ""

    # Check permission logs list
    res_perm = await client.get("/api/v1/permissions")
    assert res_perm.status_code == 200

@pytest.mark.asyncio
async def test_jarvis_chat_endpoint(client: AsyncClient):
    chat_payload = {
        "messages": [{"role": "user", "content": "How should I structure my learning today?"}],
        "context_page": "Homepage"
    }
    res = await client.post("/api/v1/chat", json=chat_payload)
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 0
