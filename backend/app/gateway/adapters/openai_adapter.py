import os
import time
from backend.app.gateway.contracts import GatewayRequest, GatewayResponse
from backend.app.core.logging import get_logger

logger = get_logger(__name__)


def call_openai(request: GatewayRequest) -> GatewayResponse:
    start = time.time()
    try:
        from openai import OpenAI
        api_key = os.environ.get("OPENAI_API_KEY", "")
        if not api_key:
            return GatewayResponse(
                content="", provider="openai", model=request.model,
                success=False, error="OPENAI_API_KEY not configured"
            )

        client = OpenAI(api_key=api_key)
        messages = [
            {"role": m.role, "content": m.content}
            for m in request.messages
        ]

        response = client.chat.completions.create(
            model=request.model,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )

        latency = (time.time() - start) * 1000
        content = response.choices[0].message.content
        logger.info("OpenAI call success", model=request.model, latency_ms=round(latency))

        return GatewayResponse(
            content=content,
            provider="openai",
            model=request.model,
            success=True,
            input_tokens=response.usage.prompt_tokens,
            output_tokens=response.usage.completion_tokens,
            latency_ms=round(latency),
        )

    except Exception as e:
        latency = (time.time() - start) * 1000
        error_str = str(e)
        logger.error("OpenAI call failed", error=error_str)
        return GatewayResponse(
            content="", provider="openai", model=request.model,
            success=False, error=f"OpenAI error: {error_str[:200]}",
            latency_ms=round(latency),
        )