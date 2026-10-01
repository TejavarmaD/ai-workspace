import os
from dataclasses import dataclass
from backend.app.gateway.classifier import ClassificationResult, TaskType
from backend.app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class RouterDecision:
    provider: str
    model: str
    reason: str
    fallbacks: list


# Routing rules — maps task types to best provider/model
ROUTING_RULES = {
    TaskType.CODING: {
        "provider": "anthropic",
        "model": "claude-sonnet-4-5",
        "reason": "Claude excels at code generation and debugging",
        "fallback": [
            {"provider": "openai", "model": "gpt-4o"},
            {"provider": "gemini", "model": "gemini-flash-latest"},
        ]
    },
    TaskType.REASONING: {
        "provider": "anthropic",
        "model": "claude-sonnet-4-5",
        "reason": "Claude has strong reasoning and analysis capabilities",
        "fallback": [
            {"provider": "openai", "model": "gpt-4o"},
            {"provider": "gemini", "model": "gemini-flash-latest"},
        ]
    },
    TaskType.MATH: {
        "provider": "openai",
        "model": "gpt-4o",
        "reason": "GPT-4o is strong at mathematical reasoning",
        "fallback": [
            {"provider": "anthropic", "model": "claude-sonnet-4-5"},
            {"provider": "gemini", "model": "gemini-flash-latest"},
        ]
    },
    TaskType.VISION: {
        "provider": "gemini",
        "model": "gemini-flash-latest",
        "reason": "Gemini Flash supports vision natively and is free",
        "fallback": [
            {"provider": "openai", "model": "gpt-4o"},
            {"provider": "anthropic", "model": "claude-sonnet-4-5"},
        ]
    },
    TaskType.CREATIVE: {
        "provider": "anthropic",
        "model": "claude-sonnet-4-5",
        "reason": "Claude produces high quality creative writing",
        "fallback": [
            {"provider": "openai", "model": "gpt-4o"},
            {"provider": "gemini", "model": "gemini-flash-latest"},
        ]
    },
    TaskType.ANALYSIS: {
        "provider": "anthropic",
        "model": "claude-sonnet-4-5",
        "reason": "Claude is excellent at deep analysis",
        "fallback": [
            {"provider": "openai", "model": "gpt-4o"},
            {"provider": "gemini", "model": "gemini-flash-latest"},
        ]
    },
    TaskType.SUMMARIZATION: {
        "provider": "gemini",
        "model": "gemini-flash-latest",
        "reason": "Gemini Flash is fast and free for summarization",
        "fallback": [
            {"provider": "anthropic", "model": "claude-sonnet-4-5"},
            {"provider": "openai", "model": "gpt-4o-mini"},
        ]
    },
    TaskType.TRANSLATION: {
        "provider": "gemini",
        "model": "gemini-flash-latest",
        "reason": "Gemini Flash handles translation well and is free",
        "fallback": [
            {"provider": "openai", "model": "gpt-4o"},
            {"provider": "anthropic", "model": "claude-sonnet-4-5"},
        ]
    },
    TaskType.SEARCH: {
        "provider": "gemini",
        "model": "gemini-flash-latest",
        "reason": "Gemini has good knowledge of recent events",
        "fallback": [
            {"provider": "openai", "model": "gpt-4o"},
            {"provider": "anthropic", "model": "claude-sonnet-4-5"},
        ]
    },
    TaskType.CONVERSATION: {
        "provider": "gemini",
        "model": "gemini-flash-latest",
        "reason": "Gemini Flash is fast and free for general conversation",
        "fallback": [
            {"provider": "anthropic", "model": "claude-sonnet-4-5"},
            {"provider": "openai", "model": "gpt-4o-mini"},
        ]
    },
}


def is_provider_available(provider: str) -> bool:
    """Check if a provider has an API key configured."""
    key_map = {
        "anthropic": "ANTHROPIC_API_KEY",
        "openai": "OPENAI_API_KEY",
        "gemini": "GOOGLE_API_KEY",
        "ollama": None,  # Local, always available
    }
    env_key = key_map.get(provider)
    if env_key is None:
        return True
    value = os.environ.get(env_key, "")
    return bool(value and value.strip())


def route(classification: ClassificationResult) -> RouterDecision:
    """
    Given a classification result, pick the best available provider and model.
    Falls back through alternatives if primary is not available.
    """
    rule = ROUTING_RULES.get(
        classification.task_type,
        ROUTING_RULES[TaskType.CONVERSATION]
    )

    primary_provider = rule["provider"]
    primary_model = rule["model"]
    fallbacks = rule.get("fallback", [])

    # Try primary
    if is_provider_available(primary_provider):
        logger.info(
            "Router selected primary",
            provider=primary_provider,
            model=primary_model,
            task=classification.task_type.value,
            reason=rule["reason"],
        )
        return RouterDecision(
            provider=primary_provider,
            model=primary_model,
            reason=rule["reason"],
            fallbacks=fallbacks,
        )

    # Try fallbacks
    for fallback in fallbacks:
        if is_provider_available(fallback["provider"]):
            logger.info(
                "Router selected fallback",
                provider=fallback["provider"],
                model=fallback["model"],
                task=classification.task_type.value,
            )
            return RouterDecision(
                provider=fallback["provider"],
                model=fallback["model"],
                reason=f"Fallback from {primary_provider} — {rule['reason']}",
                fallbacks=[],
            )

    # Last resort — gemini (free)
    logger.warning("Router using last resort — gemini")
    return RouterDecision(
        provider="gemini",
        model="gemini-flash-latest",
        reason="Last resort fallback — all primary providers unavailable",
        fallbacks=[],
    )


def auto_route(
    prompt: str,
    conversation_history: list = None
) -> tuple[RouterDecision, ClassificationResult]:
    """
    Full pipeline: classify prompt then route to best model.
    Returns (decision, classification) tuple.
    """
    from backend.app.gateway.classifier import classify_prompt
    classification = classify_prompt(prompt, conversation_history)
    decision = route(classification)
    return decision, classification