import os
import time
from backend.app.gateway.contracts import GatewayRequest, GatewayResponse
from backend.app.core.logging import get_logger

logger = get_logger(__name__)


def call_anthropic(request: GatewayRequest) -> GatewayResponse:
    start = time.time()
    try:
        import anthropic
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            return GatewayResponse(
                content="", provider="anthropic", model=request.model,
                success=False, error="ANTHROPIC_API_KEY not configured"
            )

        client = anthropic.Anthropic(api_key=api_key)
        messages = [
            {"role": m.role, "content": m.content}
            for m in request.messages
        ]

        response = client.messages.create(
            model=request.model,
            max_tokens=request.max_tokens,
            messages=messages,
        )

        latency = (time.time() - start) * 1000
        content = response.content[0].text
        logger.info("Anthropic call success", model=request.model, latency_ms=round(latency))

        return GatewayResponse(
            content=content,
            provider="anthropic",
            model=request.model,
            success=True,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            latency_ms=round(latency),
        )

    except Exception as e:
        latency = (time.time() - start) * 1000
        error_str = str(e)
        logger.error("Anthropic call failed", error=error_str)
        if "credit" in error_str.lower() or "balance" in error_str.lower():
            error_msg = "Anthropic API: Insufficient credits. Please add credits at console.anthropic.com"
        else:
            error_msg = f"Anthropic error: {error_str[:200]}"
        return GatewayResponse(
            content="", provider="anthropic", model=request.model,
            success=False, error=error_msg, latency_ms=round(latency),
        )