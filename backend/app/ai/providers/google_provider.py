import json
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from app.ai.providers.base import BaseLLMProvider, LLMResponse

class GoogleProvider(BaseLLMProvider):
    def __init__(self, api_key: str, default_model: str = "gemini-1.5-pro"):
        self.api_key = api_key
        self.default_model = default_model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        if not self.api_key or self.api_key == "mock-key-for-testing":
            prompt = messages[-1]["content"] if messages else ""
            return LLMResponse(
                content=f"[Mock Google Gemini Response for '{prompt[:30]}...']",
                model_name=self.default_model,
                finish_reason="STOP",
                usage={"prompt_tokens": 15, "completion_tokens": 30, "total_tokens": 45}
            )

        contents = []
        system_prompt = None
        for msg in messages:
            if msg.get("role") == "system":
                system_prompt = msg.get("content")
            else:
                role = "model" if msg.get("role") == "assistant" else "user"
                contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})

        url = f"{self.base_url}/models/{self.default_model}:generateContent?key={self.api_key}"
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens
            }
        }
        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()
            candidate = data["candidates"][0]
            text = candidate["content"]["parts"][0]["text"]
            return LLMResponse(
                content=text,
                model_name=self.default_model,
                finish_reason=candidate.get("finishReason", "STOP"),
                usage={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            )

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        if not self.api_key or self.api_key == "mock-key-for-testing":
            prompt = messages[-1]["content"] if messages else ""
            yield f"Mock Gemini stream chunk for: {prompt}\n"
            return

        res = await self.generate(messages, temperature, max_tokens)
        yield res.content
