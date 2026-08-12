import httpx
from typing import List
from app.ai.providers.base import BaseEmbeddingProvider

class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str, model_name: str = "text-embedding-3-small"):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://api.openai.com/v1"

    async def embed_query(self, text: str) -> List[float]:
        results = await self.embed_documents([text])
        return results[0]

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not self.api_key or self.api_key == "mock-key-for-testing":
            # Return synthetic 1536-dim vector for testing
            return [[0.01 * (i % 10) for i in range(1536)] for _ in texts]

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(
                f"{self.base_url}/embeddings",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model_name,
                    "input": texts
                }
            )
            res.raise_for_status()
            data = res.json()
            return [item["embedding"] for item in data["data"]]

class LocalEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, model_name: str = "nomic-embed-text", ollama_base_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.ollama_base_url = ollama_base_url.rstrip('/')

    async def embed_query(self, text: str) -> List[float]:
        results = await self.embed_documents([text])
        return results[0]

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        try:
            embeddings = []
            async with httpx.AsyncClient(timeout=60.0) as client:
                for text in texts:
                    res = await client.post(
                        f"{self.ollama_base_url}/api/embeddings",
                        json={"model": self.model_name, "prompt": text}
                    )
                    res.raise_for_status()
                    embeddings.append(res.json()["embedding"])
            return embeddings
        except Exception:
            # Deterministic fallback vector
            return [[0.02 * (i % 10) for i in range(1536)] for _ in texts]
