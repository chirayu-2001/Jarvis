import httpx
import json
import asyncio

async def test_flow():
    async with httpx.AsyncClient() as client:
        print("1. Creating Trajectory...")
        traj_res = await client.post("http://localhost:8000/api/v1/trajectories", json={
            "title": "Stock Market Swing Trading",
            "kind": "money",
            "goal": "I want to become a swing trader in Indian stock markets. I have already invested some capital in it. But I lack in depth knowlegde about stock markets and I want to learn about it. I want to learn fundamental analysis, technical analysis, thematic analysis, quarterly analysis, basically all the jargons about stock market",
            "subtitle": "Learning the ropes"
        })
        traj_res.raise_for_status()
        traj = traj_res.json()
        print("Trajectory created:", traj["id"], traj["title"])
        traj_id = traj["id"]

        print("\n2. Sending Chat Request (Streaming) to Jarvis...")
        chat_payload = {
            "messages": [{"role": "user", "content": f'Jarvis, help me build a comprehensive plan for my goal: "{traj["goal"]}". What do you need to know first?'}],
            "context_page": "Trajectory Context",
            "trajectory_id": traj_id
        }
        
        # We use no timeout since the LLM might take time to stream the tool calls
        async with client.stream("POST", "http://localhost:8000/api/v1/chat/stream", json=chat_payload, timeout=None) as response:
            async for line in response.aiter_lines():
                if line.strip():
                    print(line)

        print("\n3. Verifying the plan on Trajectory...")
        traj_detail_res = await client.get(f"http://localhost:8000/api/v1/trajectories/{traj_id}")
        traj_detail = traj_detail_res.json()
        if "active_plan" in traj_detail and traj_detail["active_plan"]:
            plan = traj_detail["active_plan"]
            print(f"Success! Plan created with ID: {plan['id']}")
            print(f"Number of steps generated: {len(plan['steps'])}")
            for step in plan['steps']:
                print(f"  - [{step['week_label']}] {step['title']}")
        else:
            print("Failed: No active plan found on the trajectory.")

if __name__ == "__main__":
    asyncio.run(test_flow())
