import re
from dataclasses import dataclass
from enum import Enum
from backend.app.core.logging import get_logger

logger = get_logger(__name__)


class TaskType(str, Enum):
    CODING = "coding"
    MATH = "math"
    CREATIVE = "creative"
    ANALYSIS = "analysis"
    TRANSLATION = "translation"
    SUMMARIZATION = "summarization"
    REASONING = "reasoning"
    VISION = "vision"
    CONVERSATION = "conversation"
    SEARCH = "search"


@dataclass
class ClassificationResult:
    task_type: TaskType
    confidence: float
    requires_vision: bool = False
    requires_tools: bool = False
    requires_search: bool = False
    estimated_tokens: int = 500
    reasoning: str = ""


TASK_PATTERNS = {
    TaskType.CODING: [
        r'\b(code|program|function|class|debug|fix|implement|algorithm|api|sql|python|javascript|typescript|react|fastapi|error|bug|syntax|script|refactor|optimize)\b',
        r'\b(def |class |import |const |let |var |function |return |async |await )\b',
        r'```',
        r'\b(git|docker|kubernetes|terminal|bash|shell|cli)\b',
    ],
    TaskType.MATH: [
        r'\b(calculate|compute|solve|equation|math|algebra|calculus|derivative|integral|probability|statistics|formula|theorem|percentage|ratio)\b',
        r'\d+\s*[\+\-\*\/\^]\s*\d+',
        r'\b(sum|product|matrix|vector|integral|differential)\b',
    ],
    TaskType.CREATIVE: [
        r'\b(write|create|generate|story|poem|essay|creative|fiction|narrative|character|plot|imagine|draft|compose|blog|article|lyrics|script|caption|slogan)\b',
    ],
    TaskType.ANALYSIS: [
        r'\b(analyze|analyse|compare|evaluate|assess|review|critique|pros|cons|advantages|disadvantages|impact|effect|research|study|report|findings|insight|trend|pattern)\b',
    ],
    TaskType.TRANSLATION: [
        r'\b(translate|translation|convert|language|english|spanish|french|german|chinese|japanese|arabic|hindi|korean)\b',
    ],
    TaskType.SUMMARIZATION: [
        r'\b(summarize|summary|tldr|brief|overview|highlight|key points|main points|condense|shorten|recap)\b',
    ],
    TaskType.REASONING: [
        r'\b(why|reason|explain|logic|deduce|infer|conclude|therefore|because|cause|effect|step by step|think through|breakdown|philosophy|ethics)\b',
    ],
    TaskType.VISION: [
        r'\b(image|photo|picture|screenshot|diagram|chart|graph|visual|look at|see|describe|what is in|identify)\b',
    ],
    TaskType.SEARCH: [
        r'\b(search|find|lookup|current|latest|today|news|recent|now|trending|what happened|who is|price|weather)\b',
        r'\b(2024|2025|2026)\b',
    ],
}


def classify_prompt(
    prompt: str,
    conversation_history: list = None
) -> ClassificationResult:
    prompt_lower = prompt.lower()
    scores = {task_type: 0.0 for task_type in TaskType}

    for task_type, patterns in TASK_PATTERNS.items():
        for pattern in patterns:
            matches = re.findall(pattern, prompt_lower, re.IGNORECASE)
            if matches:
                scores[task_type] += len(matches) * 0.3

    # Vision check from history
    requires_vision = False
    if conversation_history:
        for msg in conversation_history:
            if isinstance(msg.get('content'), list):
                requires_vision = True
                scores[TaskType.VISION] += 2.0

    # Estimate tokens
    estimated_tokens = int(len(prompt.split()) * 1.3)
    if conversation_history:
        for msg in conversation_history[-5:]:
            estimated_tokens += int(len(str(msg.get('content', '')).split()) * 1.3)

    best_task = max(scores, key=scores.get)
    best_score = scores[best_task]

    if best_score < 0.3:
        best_task = TaskType.CONVERSATION
        best_score = 0.5
        reasoning = "No specific pattern detected — defaulting to conversation"
    else:
        reasoning = f"Detected {best_task.value} with score {round(best_score, 2)}"

    requires_tools = best_task in [TaskType.CODING, TaskType.MATH]
    requires_search = best_task == TaskType.SEARCH

    logger.info(
        "Prompt classified",
        task_type=best_task.value,
        confidence=round(min(best_score, 1.0), 2),
        estimated_tokens=estimated_tokens,
    )

    return ClassificationResult(
        task_type=best_task,
        confidence=min(best_score, 1.0),
        requires_vision=requires_vision,
        requires_tools=requires_tools,
        requires_search=requires_search,
        estimated_tokens=estimated_tokens,
        reasoning=reasoning,
    )