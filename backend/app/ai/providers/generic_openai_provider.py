import json
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from app.ai.providers.base import BaseLLMProvider, LLMResponse

class GenericOpenAIProvider(BaseLLMProvider):
    def __init__(self, base_url: str = "http://localhost:8000/v1", api_key: str = "custom", default_model: str = "default"):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key or "custom"
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
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format:
            payload["response_format"] = response_format

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
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
        except Exception:
            prompt = messages[-1]["content"] if messages else ""
            return LLMResponse(
                content=f"[Generic OpenAI-compatible fallback for '{prompt[:30]}...']",
                model_name=self.default_model,
                finish_reason="stop",
                usage={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            )

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        res = await self.generate(messages, temperature, max_tokens)
        yield res.content
