from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ChatMessage:
    role: str  # "user" or "assistant"
    content: str


@dataclass
class GatewayRequest:
    """Normalized request sent to any provider."""
    messages: list[ChatMessage]
    provider: str
    model: str
    max_tokens: int = 2048
    temperature: float = 0.7
    system_prompt: Optional[str] = None


@dataclass
class GatewayResponse:
    """Normalized response from any provider."""
    content: str
    provider: str
    model: str
    success: bool = True
    error: Optional[str] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    latency_ms: Optional[float] = None


# Registry of all supported providers and their models
PROVIDER_REGISTRY = {
    "gemini": {
        "display_name": "Google Gemini",
        "requires_api_key": True,
        "env_key": "GOOGLE_API_KEY",
        "models": [
            {
                "id": "gemini-2.5-flash-lite",
                "name": "Gemini 2.5 Flash-Lite",
                "context_window": 1048576,
                "supports_streaming": True,
                "supports_vision": True,
                "supports_tools": True,
                "is_free": True,
            },
            {
                "id": "gemini-2.5-pro",
                "name": "Gemini 2.5 Pro",
                "context_window": 2097152,
                "supports_streaming": True,
                "supports_vision": True,
                "supports_tools": True,
                "is_free": False,
            },
        ],
    },
    "anthropic": {
        "display_name": "Anthropic Claude",
        "requires_api_key": True,
        "env_key": "ANTHROPIC_API_KEY",
        "models": [
            {
                "id": "claude-sonnet-4-5",
                "name": "Claude Sonnet",
                "context_window": 200000,
                "supports_streaming": True,
                "supports_vision": True,
                "supports_tools": True,
                "is_free": False,
            },
            {
                "id": "claude-haiku-4-5",
                "name": "Claude Haiku",
                "context_window": 200000,
                "supports_streaming": True,
                "supports_vision": True,
                "supports_tools": True,
                "is_free": False,
            },
        ],
    },
    "openai": {
        "display_name": "OpenAI",
        "requires_api_key": True,
        "env_key": "OPENAI_API_KEY",
        "models": [
            {
                "id": "gpt-4o",
                "name": "GPT-4o",
                "context_window": 128000,
                "supports_streaming": True,
                "supports_vision": True,
                "supports_tools": True,
                "is_free": False,
            },
            {
                "id": "gpt-4o-mini",
                "name": "GPT-4o Mini",
                "context_window": 128000,
                "supports_streaming": True,
                "supports_vision": True,
                "supports_tools": True,
                "is_free": False,
            },
        ],
    },
    "ollama": {
        "display_name": "Ollama (Local)",
        "requires_api_key": False,
        "env_key": None,
        "models": [
            {
                "id": "llama3.2",
                "name": "Llama 3.2 (Local)",
                "context_window": 128000,
                "supports_streaming": True,
                "supports_vision": False,
                "supports_tools": False,
                "is_free": True,
            },
            {
                "id": "mistral",
                "name": "Mistral (Local)",
                "context_window": 32000,
                "supports_streaming": True,
                "supports_vision": False,
                "supports_tools": False,
                "is_free": True,
            },
        ],
    },
}