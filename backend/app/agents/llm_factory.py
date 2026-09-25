"""
LLM Factory & Free / Local Provider Selector
--------------------------------------------
Provides model instances with native support for 100% FREE options:
1. Ollama (100% Free & Local, runs on your Mac with 0 API keys)
2. Google Gemini API (Free tier via Google AI Studio, 1500 free requests/day)
3. Groq Cloud (Free tier via console.groq.com with ultra-fast Llama 3.3)
4. OpenRouter (Free tier models)
5. OpenAI / Anthropic (Paid commercial alternatives)
6. Offline Fallback (Rule-based deterministic engine, $0 cost)
"""

import os
from typing import Optional, Any
from app.config import settings


def get_llm(model_name: Optional[str] = None, temperature: float = 0.2) -> Optional[Any]:
    """
    Initializes a LangChain chat model.
    Checks free & configured providers in priority order.
    Returns None if no provider is reachable, enabling offline rule fallbacks.
    """
    # --------------------------------------------------------------------------
    # 1. Local Free LLM: Ollama (100% Local, Private, $0, Zero API keys)
    # --------------------------------------------------------------------------
    if settings.USE_LOCAL_OLLAMA or os.environ.get("USE_LOCAL_OLLAMA", "").lower() in ("true", "1"):
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=settings.OLLAMA_MODEL,
                temperature=temperature,
                base_url=settings.OLLAMA_BASE_URL,
                api_key="ollama"  # Ollama doesn't require a real key
            )
        except Exception:
            pass

    # --------------------------------------------------------------------------
    # 2. Free Cloud LLM: Google Gemini Free Tier (Google AI Studio)
    # Free tier gives 15 RPM and 1,500 requests/day with no credit card required.
    # --------------------------------------------------------------------------
    gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
    if gemini_key and gemini_key not in ("your_gemini_api_key_here", ""):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            target_model = model_name or settings.DEFAULT_LLM_MODEL
            if not target_model or not target_model.startswith("gemini"):
                target_model = "gemini-3.5-flash-lite"
            return ChatGoogleGenerativeAI(
                model=target_model,
                temperature=temperature,
                google_api_key=gemini_key
            )
        except Exception:
            pass

    # --------------------------------------------------------------------------
    # 3. Free Cloud LLM: Groq Cloud (console.groq.com)
    # Free tier provides high-speed Llama 3.3 70B & Llama 3.1 8B with generous limits.
    # --------------------------------------------------------------------------
    groq_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
    if groq_key and groq_key not in ("your_groq_api_key_here", ""):
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=model_name or "llama-3.3-70b-versatile",
                temperature=temperature,
                base_url="https://api.groq.com/openai/v1",
                api_key=groq_key
            )
        except Exception:
            pass

    # --------------------------------------------------------------------------
    # 4. Free Cloud LLM: OpenRouter Free Models (openrouter.ai)
    # --------------------------------------------------------------------------
    openrouter_key = settings.OPENROUTER_API_KEY or os.environ.get("OPENROUTER_API_KEY")
    if openrouter_key and openrouter_key not in ("your_openrouter_api_key_here", ""):
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=model_name or "meta-llama/llama-3.1-8b-instruct:free",
                temperature=temperature,
                base_url="https://openrouter.ai/api/v1",
                api_key=openrouter_key
            )
        except Exception:
            pass

    # --------------------------------------------------------------------------
    # 5. Commercial Paid LLMs (OpenAI / Anthropic)
    # --------------------------------------------------------------------------
    openai_key = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")
    if openai_key and openai_key not in ("your_openai_api_key_here", ""):
        try:
            from langchain_openai import ChatOpenAI
            target_model = model_name or settings.DEFAULT_LLM_MODEL
            return ChatOpenAI(
                model=target_model if "gpt" in target_model else "gpt-4o-mini",
                temperature=temperature,
                api_key=openai_key
            )
        except Exception:
            pass

    anthropic_key = settings.ANTHROPIC_API_KEY or os.environ.get("ANTHROPIC_API_KEY")
    if anthropic_key and anthropic_key not in ("your_anthropic_api_key_here", ""):
        try:
            from langchain_anthropic import ChatAnthropic
            return ChatAnthropic(
                model="claude-3-5-sonnet-20241022",
                temperature=temperature,
                api_key=anthropic_key
            )
        except Exception:
            pass

    # --------------------------------------------------------------------------
    # 6. Fallback: Return None to use our built-in offline rule/template engine
    # --------------------------------------------------------------------------
    return None


def clean_llm_text(content: Any) -> str:
    """
    Safely extracts a plain string from either:
    - a standard string
    - a list of content blocks (e.g. [{'type': 'text', 'text': '...'}])
    - any other primitive representation
    """
    if not content:
        return ""
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict):
                parts.append(item.get("text", ""))
            else:
                parts.append(str(item))
        return "".join(parts).strip()
    return str(content).strip()
