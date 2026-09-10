import os
import time
from backend.app.gateway.contracts import GatewayRequest, GatewayResponse
from backend.app.core.logging import get_logger

logger = get_logger(__name__)


def call_gemini(request: GatewayRequest) -> GatewayResponse:
    start = time.time()
    try:
        from google import genai
        api_key = os.environ.get("GOOGLE_API_KEY", "")
        if not api_key:
            return GatewayResponse(
                content="", provider="gemini", model=request.model,
                success=False, error="GOOGLE_API_KEY not configured"
            )

        client = genai.Client(api_key=api_key)
        contents = []
        for msg in request.messages:
            role = "user" if msg.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.content}]})

        response = client.models.generate_content(
            model=request.model,
            contents=contents,
        )

        latency = (time.time() - start) * 1000
        logger.info("Gemini call success", model=request.model, latency_ms=round(latency))

        return GatewayResponse(
            content=response.text,
            provider="gemini",
            model=request.model,
            success=True,
            latency_ms=round(latency),
        )

    except Exception as e:
        latency = (time.time() - start) * 1000
        error_str = str(e)
        logger.error("Gemini call failed", error=error_str, model=request.model)
        return GatewayResponse(
            content="", provider="gemini", model=request.model,
            success=False, error=f"Gemini error: {error_str[:200]}",
            latency_ms=round(latency),
        )