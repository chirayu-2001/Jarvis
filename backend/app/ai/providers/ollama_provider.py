import json
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from app.ai.providers.base import BaseLLMProvider, LLMResponse
from app.ai.providers.openai_provider import parse_prompt_and_build_dynamic_steps

class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: str = "http://localhost:11434", default_model: str = "llama3.1:8b"):
        self.base_url = base_url.rstrip('/')
        self.default_model = default_model

    async def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        payload = {
            "model": self.default_model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        if response_format and response_format.get("type") == "json_object":
            payload["format"] = "json"

        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                res.raise_for_status()
                data = res.json()
                return LLMResponse(
                    content=data.get("message", {}).get("content", ""),
                    model_name=data.get("model", self.default_model),
                    finish_reason="stop",
                    usage={"prompt_tokens": data.get("prompt_eval_count", 0), "completion_tokens": data.get("eval_count", 0), "total_tokens": 0}
                )
        except Exception as e:
            print(f"Ollama generate error: {repr(e)}")
            # Fallback mock when Ollama daemon is offline/not running locally
            prompt = messages[-1]["content"] if messages else ""
            mock_content = f"[Ollama local fallback for '{prompt[:30]}...']"
            if response_format and response_format.get("type") == "json_object":
                dynamic_steps = parse_prompt_and_build_dynamic_steps(prompt)
                mock_content = json.dumps({
                    "summary": "Local Ollama fallback analysis",
                    "linked_trajectories": [],
                    "proposal": "Maintain current pace",
                    "steps": dynamic_steps
                })
            return LLMResponse(
                content=mock_content,
                model_name=f"{self.default_model} (fallback)",
                finish_reason="stop",
                usage={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            )

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        payload = {
            "model": self.default_model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": temperature, "num_predict": max_tokens}
        }

        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                chunk = json.loads(line)
                                delta = chunk.get("message", {}).get("content", "")
                                if delta:
                                    yield delta
                            except Exception:
                                continue
        except Exception:
            prompt = messages[-1]["content"] if messages else ""
            yield f"[Ollama stream offline fallback for prompt: {prompt}]\n"
