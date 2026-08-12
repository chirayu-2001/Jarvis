import asyncio
import json
import httpx

async def test_sse():
    url = "http://localhost:8000/api/v1/plans/generate"
    payload = {
        "trajectory_id": "d506cf6b-5b35-4dd3-a18c-be8d925207a4",
        "mode": "balanced"
    }
    
    print(f"Connecting to {url}...")
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                print(f"Status: {response.status_code}")
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = json.loads(line[6:])
                        print(f"[{data.get('type')}] {data.get('content')}")
                        if data.get("type") == "done":
                            break
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_sse())
