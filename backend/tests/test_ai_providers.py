import pytest
from app.ai.router import ai_router
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.anthropic_provider import AnthropicProvider
from app.ai.providers.google_provider import GoogleProvider
from app.ai.providers.ollama_provider import OllamaProvider

@pytest.mark.asyncio
async def test_openai_provider():
    provider = OpenAIProvider(api_key="mock-key-for-testing")
    res = await provider.generate("Test prompt", system_prompt="Test system")
    assert res.content != ""
    assert res.model_name == "gpt-4o"
    assert res.finish_reason == "stop"

@pytest.mark.asyncio
async def test_anthropic_provider():
    provider = AnthropicProvider(api_key="mock-key-for-testing")
    res = await provider.generate("Test prompt")
    assert res.content != ""
    assert res.model_name == "claude-3-5-sonnet-20241022"

@pytest.mark.asyncio
async def test_google_provider():
    provider = GoogleProvider(api_key="mock-key-for-testing")
    res = await provider.generate("Test prompt")
    assert res.content != ""

@pytest.mark.asyncio
async def test_ollama_provider_fallback():
    provider = OllamaProvider(base_url="http://localhost:99999", default_model="llama3.1:8b")
    res = await provider.generate("Test prompt")
    assert res.content != ""
    assert "fallback" in res.model_name.lower() or "ollama" in res.content.lower()

@pytest.mark.asyncio
async def test_ai_router_generate_and_fallback():
    res = await ai_router.generate_for_task(
        task_name="journal_analysis",
        prompt="Synthesize my thoughts"
    )
    assert res.content != ""

@pytest.mark.asyncio
async def test_embeddings_provider():
    vectors = await ai_router.embeddings.embed_documents(["Test sentence 1", "Test sentence 2"])
    assert len(vectors) == 2
    assert len(vectors[0]) == 1536
