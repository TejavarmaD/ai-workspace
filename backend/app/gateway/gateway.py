import os
from backend.app.gateway.contracts import GatewayRequest, GatewayResponse, ChatMessage
from backend.app.core.logging import get_logger

logger = get_logger(__name__)


def get_provider_status() -> list:
    """Check which providers are configured and available."""
    from backend.app.gateway.contracts import PROVIDER_REGISTRY
    statuses = []
    for provider_id, config in PROVIDER_REGISTRY.items():
        env_key = config.get("env_key")
        if env_key:
            api_key = os.environ.get(env_key, "")
            is_configured = bool(api_key and api_key.strip())
        else:
            is_configured = True  # Local providers like Ollama

        statuses.append({
            "id": provider_id,
            "display_name": config["display_name"],
            "is_configured": is_configured,
            "requires_api_key": config["requires_api_key"],
            "models": config["models"],
        })
    return statuses


def execute(request: GatewayRequest) -> GatewayResponse:
    """Route request to the correct provider adapter."""
    provider = request.provider.lower()
    logger.info("Gateway executing", provider=provider, model=request.model)

    if provider == "gemini":
        from backend.app.gateway.adapters.gemini import call_gemini
        return call_gemini(request)

    elif provider == "anthropic":
        from backend.app.gateway.adapters.anthropic import call_anthropic
        return call_anthropic(request)

    elif provider == "openai":
        from backend.app.gateway.adapters.openai_adapter import call_openai
        return call_openai(request)

    elif provider == "ollama":
        from backend.app.gateway.adapters.ollama import call_ollama
        return call_ollama(request)

    else:
        return GatewayResponse(
            content="",
            provider=provider,
            model=request.model,
            success=False,
            error=f"Unknown provider: '{provider}'. Supported: gemini, anthropic, openai, ollama",
        )


def build_request(
    messages: list,
    provider: str,
    model: str,
    max_tokens: int = 2048,
    temperature: float = 0.7,
) -> GatewayRequest:
    """Build a normalized gateway request from raw message dicts."""
    chat_messages = [
        ChatMessage(role=m["role"], content=m["content"])
        for m in messages
    ]
    return GatewayRequest(
        messages=chat_messages,
        provider=provider,
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
    )