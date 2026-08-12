from typing import Dict, Any, Optional, AsyncGenerator
from app.core.config import settings
from app.ai.providers.base import BaseLLMProvider, BaseEmbeddingProvider, LLMResponse
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.anthropic_provider import AnthropicProvider
from app.ai.providers.google_provider import GoogleProvider
from app.ai.providers.ollama_provider import OllamaProvider
from app.ai.providers.generic_openai_provider import GenericOpenAIProvider
from app.ai.providers.embedding_providers import OpenAIEmbeddingProvider, LocalEmbeddingProvider

class AIRouter:
    def __init__(self):
        self._providers: Dict[str, BaseLLMProvider] = {}
        self._embedding_provider: Optional[BaseEmbeddingProvider] = None
        self._init_providers()

    def _init_providers(self):
        # Register available providers based on settings
        self._providers["openai"] = OpenAIProvider(
            api_key=settings.OPENAI_API_KEY or "",
            default_model=settings.LLM_DEFAULT_MODEL
        )
        self._providers["anthropic"] = AnthropicProvider(
            api_key=settings.ANTHROPIC_API_KEY or "",
            default_model=settings.LLM_CHAT_MODEL
        )
        self._providers["google"] = GoogleProvider(
            api_key=settings.GOOGLE_API_KEY or "",
            default_model="gemini-1.5-pro"
        )
        self._providers["ollama"] = OllamaProvider(
            base_url=settings.OLLAMA_BASE_URL,
            default_model=settings.LLM_FALLBACK_MODEL
        )
        self._providers["generic"] = GenericOpenAIProvider(
            base_url=settings.GENERIC_OPENAI_BASE_URL or "http://localhost:8000/v1",
            api_key=settings.GENERIC_OPENAI_API_KEY or "custom",
            default_model="default"
        )

        # Embedding Provider setup
        if settings.EMBEDDING_PROVIDER == "openai":
            self._embedding_provider = OpenAIEmbeddingProvider(
                api_key=settings.OPENAI_API_KEY or "",
                model_name=settings.EMBEDDING_MODEL
            )
        else:
            self._embedding_provider = LocalEmbeddingProvider(
                model_name=settings.EMBEDDING_MODEL,
                ollama_base_url=settings.OLLAMA_BASE_URL
            )

    def get_provider_for_task(self, task_name: str) -> BaseLLMProvider:
        provider_name = settings.LLM_DEFAULT_PROVIDER
        if task_name == "journal_analysis":
            provider_name = settings.LLM_JOURNAL_ANALYSIS_PROVIDER
        elif task_name == "plan_generation":
            provider_name = settings.LLM_PLAN_GENERATION_PROVIDER
        elif task_name == "chat":
            provider_name = settings.LLM_CHAT_PROVIDER

        return self._providers.get(provider_name, self._providers["openai"])

    def get_fallback_provider(self) -> BaseLLMProvider:
        return self._providers.get(settings.LLM_FALLBACK_PROVIDER, self._providers["ollama"])

    async def generate_for_task(
        self,
        task_name: str,
        messages: list[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        primary = self.get_provider_for_task(task_name)
        try:
            return await primary.generate(
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format=response_format
            )
        except Exception as e:
            if settings.LLM_ENABLE_FALLBACK:
                fallback = self.get_fallback_provider()
                return await fallback.generate(
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format=response_format
                )
            raise e

    async def generate_stream_for_task(
        self,
        task_name: str,
        messages: list[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        primary = self.get_provider_for_task(task_name)
        try:
            async for chunk in primary.generate_stream(messages, temperature, max_tokens):
                yield chunk
        except Exception:
            if settings.LLM_ENABLE_FALLBACK:
                fallback = self.get_fallback_provider()
                async for chunk in fallback.generate_stream(messages, temperature, max_tokens):
                    yield chunk

    @property
    def embeddings(self) -> BaseEmbeddingProvider:
        return self._embedding_provider

ai_router = AIRouter()
