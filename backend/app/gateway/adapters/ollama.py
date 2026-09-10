import os
import time
import json
import urllib.request
from backend.app.gateway.contracts import GatewayRequest, GatewayResponse
from backend.app.core.logging import get_logger

logger = get_logger(__name__)


def call_ollama(request: GatewayRequest) -> GatewayResponse:
    start = time.time()
    try:
        base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        messages = [
            {"role": m.role, "content": m.content}
            for m in request.messages
        ]

        payload = json.dumps({
            "model": request.model,
            "messages": messages,
            "stream": False,
        }).encode()

        req = urllib.request.Request(
            f"{base_url}/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())

        latency = (time.time() - start) * 1000
        content = data["message"]["content"]
        logger.info("Ollama call success", model=request.model, latency_ms=round(latency))

        return GatewayResponse(
            content=content,
            provider="ollama",
            model=request.model,
            success=True,
            latency_ms=round(latency),
        )

    except Exception as e:
        latency = (time.time() - start) * 1000
        error_str = str(e)
        logger.error("Ollama call failed", error=error_str)
        if "Connection refused" in error_str or "urlopen error" in error_str:
            error_msg = "Ollama is not running. Start it with: ollama serve"
        else:
            error_msg = f"Ollama error: {error_str[:200]}"
        return GatewayResponse(
            content="", provider="ollama", model=request.model,
            success=False, error=error_msg, latency_ms=round(latency),
        )