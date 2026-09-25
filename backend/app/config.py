"""
Application Configuration Module
--------------------------------
Loads environment variables safely using Pydantic Settings with fallback defaults.
"""

from typing import List, Optional, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[".env", "backend/.env", "../backend/.env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Application settings
    APP_NAME: str = "Autonomous Market & Financial Research Dashboard"
    DEBUG: bool = False
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [x.strip() for x in self.ALLOWED_ORIGINS.split(",") if x.strip()]

    # LLM Provider Keys
    OPENAI_API_KEY: Optional[str] = Field(default=None, description="OpenAI API Key")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, description="Anthropic API Key")
    GEMINI_API_KEY: Optional[str] = Field(default=None, description="Google Gemini API Key (Free tier via Google AI Studio)")
    GROQ_API_KEY: Optional[str] = Field(default=None, description="Groq Cloud API Key (Free tier via console.groq.com)")
    OPENROUTER_API_KEY: Optional[str] = Field(default=None, description="OpenRouter API Key (Supports free models)")
    
    # Local & Free Models (Ollama)
    USE_LOCAL_OLLAMA: bool = Field(default=False, description="Set True to use local Ollama instance")
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434/v1", description="Ollama OpenAI-compatible endpoint")
    OLLAMA_MODEL: str = Field(default="llama3.2", description="Local model name in Ollama")

    DEFAULT_LLM_MODEL: str = "gemini-3.5-flash-lite"

    # Qdrant Vector DB Settings
    # ":memory:" allows running an embedded in-memory Qdrant instance with zero external dependencies
    QDRANT_LOCATION: str = ":memory:"
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "sec_filings"

    # Financial APIs
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    FMP_API_KEY: Optional[str] = None
    SEC_EDGAR_USER_AGENT: str = "FinancialResearchAgent Admin@example.com"

    # Observability
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_PROJECT: str = "financial-research-agent"


# Singleton instance of settings
settings = Settings()
