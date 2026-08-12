import json
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from app.ai.providers.base import BaseLLMProvider, LLMResponse

class AnthropicProvider(BaseLLMProvider):
    def __init__(self, api_key: str, default_model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key
        self.default_model = default_model
        self.base_url = "https://api.anthropic.com/v1"

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
                content=f"[Mock Anthropic Claude Response for '{prompt[:30]}...']",
                model_name=self.default_model,
                finish_reason="end_turn",
                usage={"prompt_tokens": 12, "completion_tokens": 25, "total_tokens": 37}
            )

        system_prompt = None
        user_messages = []
        for msg in messages:
            if msg.get("role") == "system":
                system_prompt = msg.get("content")
            else:
                user_messages.append(msg)

        payload = {
            "model": self.default_model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": user_messages
        }
        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(
                f"{self.base_url}/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json=payload
            )
            res.raise_for_status()
            data = res.json()
            text_content = data["content"][0]["text"]
            usage = data.get("usage", {})
            return LLMResponse(
                content=text_content,
                model_name=data.get("model", self.default_model),
                finish_reason=data.get("stop_reason", "end_turn"),
                usage={
                    "prompt_tokens": usage.get("input_tokens", 0),
                    "completion_tokens": usage.get("output_tokens", 0),
                    "total_tokens": usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
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
            yield f"Mock Anthropic stream chunk for: {prompt}\n"
            return

        system_prompt = None
        user_messages = []
        for msg in messages:
            if msg.get("role") == "system":
                system_prompt = msg.get("content")
            else:
                user_messages.append(msg)

        payload = {
            "model": self.default_model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": True,
            "messages": user_messages
        }
        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        try:
                            event = json.loads(data_str)
                            if event.get("type") == "content_block_delta":
                                delta_text = event.get("delta", {}).get("text", "")
                                if delta_text:
                                    yield delta_text
                        except Exception:
                            continue
