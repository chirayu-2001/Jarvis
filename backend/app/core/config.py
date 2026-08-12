import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Jarvis Personal OS"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Postgres configuration
    POSTGRES_USER: str = "jarvis"
    POSTGRES_PASSWORD: str = "jarvis_pass"
    POSTGRES_DB: str = "jarvis_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    # LLM Providers Configuration
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    GENERIC_OPENAI_BASE_URL: Optional[str] = None
    GENERIC_OPENAI_API_KEY: Optional[str] = None

    # Routing Defaults
    LLM_DEFAULT_PROVIDER: str = "openai"
    LLM_DEFAULT_MODEL: str = "gpt-4o"

    LLM_JOURNAL_ANALYSIS_PROVIDER: str = "openai"
    LLM_JOURNAL_ANALYSIS_MODEL: str = "gpt-4o-mini"

    LLM_PLAN_GENERATION_PROVIDER: str = "openai"
    LLM_PLAN_GENERATION_MODEL: str = "gpt-4o"

    LLM_CHAT_PROVIDER: str = "openai"
    LLM_CHAT_MODEL: str = "gpt-4o"

    # Embeddings Config
    EMBEDDING_PROVIDER: str = "openai"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Fallback Configuration
    LLM_ENABLE_FALLBACK: bool = True
    LLM_FALLBACK_PROVIDER: str = "ollama"
    LLM_FALLBACK_MODEL: str = "llama3.1:8b"

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def async_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
