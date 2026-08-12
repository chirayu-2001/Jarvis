import json
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from app.ai.providers.base import BaseLLMProvider, LLMResponse

def parse_prompt_and_build_dynamic_steps(prompt: str) -> List[Dict[str, Any]]:
    title = "Trajectory"
    goal = "Goal"
    mode = "balanced"
    
    for line in prompt.splitlines():
        if line.startswith("Trajectory Title:"):
            title = line.replace("Trajectory Title:", "").strip()
        elif line.startswith("Goal:"):
            goal = line.replace("Goal:", "").strip()
        elif line.startswith("Requested Execution Mode:"):
            mode = line.replace("Requested Execution Mode:", "").strip().lower()

    if mode == "lighter":
        return [
            {"title": f"Quick start: 15-min focus on {title}", "detail": f"Identify single highest-leverage move for '{goal}' and execute today.", "week_label": "Day 1", "step_order": 1},
            {"title": f"Light experiment & reference gathering", "detail": f"Collect core references for {title} without over-consuming.", "week_label": "Day 3", "step_order": 2},
            {"title": f"1-week momentum review", "detail": f"Assess progress on '{goal}' and decide next step.", "week_label": "Day 7", "step_order": 3}
        ]
    elif mode == "intense":
        return [
            {"title": f"Deconstruct {title} architecture", "detail": f"Map all technical requirements to accomplish '{goal}'.", "week_label": "Week 1", "step_order": 1},
            {"title": f"Build core prototype for {title}", "detail": f"Ship initial working version of '{goal}' with zero scope creep.", "week_label": "Week 2", "step_order": 2},
            {"title": f"Stress test & deploy artifact", "detail": f"Test edge cases and release deliverable for {title}.", "week_label": "Week 3", "step_order": 3},
            {"title": f"Automate & systemize execution", "detail": f"Turn '{goal}' into a repeatable workflow.", "week_label": "Week 4", "step_order": 4}
        ]
    else: # balanced
        return [
            {"title": f"Define scope & core specifications for {title}", "detail": f"Clarify exact deliverables for goal: '{goal}'.", "week_label": "Week 1", "step_order": 1},
            {"title": f"Build minimum viable implementation", "detail": f"Create working prototype for '{goal}'.", "week_label": "Week 2", "step_order": 2},
            {"title": f"Test, iterate, and solve edge cases", "detail": f"Refine performance and polish '{title}'.", "week_label": "Week 3", "step_order": 3},
            {"title": f"Ship & lock in trajectory momentum", "detail": f"Complete initial version of '{goal}' and update standing overview.", "week_label": "Week 4", "step_order": 4}
        ]

class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str, default_model: str = "gpt-4o"):
        self.api_key = api_key
        self.default_model = default_model
        self.base_url = "https://api.openai.com/v1"

    async def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        if not self.api_key or self.api_key == "mock-key-for-testing":
            # Return dynamic synthetic structured response for testing
            prompt = messages[-1]["content"] if messages else ""
            mock_content = f"[Mock OpenAI Response for '{prompt[:30]}...']"
            if response_format and response_format.get("type") == "json_object":
                dynamic_steps = parse_prompt_and_build_dynamic_steps(prompt)
                mock_content = json.dumps({
                    "summary": "Dynamic structured analysis",
                    "linked_trajectories": [],
                    "proposal": "Dynamic refactor proposal",
                    "steps": dynamic_steps
                })
            return LLMResponse(
                content=mock_content,
                model_name=self.default_model,
                finish_reason="stop",
                usage={"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30}
            )

        payload = {
            "model": self.default_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format:
            payload["response_format"] = response_format

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json=payload
            )
            res.raise_for_status()
            data = res.json()
            choice = data["choices"][0]
            usage = data.get("usage", {})
            return LLMResponse(
                content=choice["message"]["content"],
                model_name=data.get("model", self.default_model),
                finish_reason=choice.get("finish_reason", "stop"),
                usage={
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0)
                }
            )

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        if not self.api_key or self.api_key == "mock-key-for-testing":
            prompt = messages[-1]["content"] if messages else ""
            yield f"Mock streaming response chunk 1 for: {prompt}\n"
            yield "Mock streaming response chunk 2 complete."
            return

        payload = {
            "model": self.default_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk_data = json.loads(data_str)
                            delta = chunk_data["choices"][0].get("delta", {}).get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            continue
