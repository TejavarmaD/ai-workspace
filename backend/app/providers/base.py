from abc import ABC, abstractmethod
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class ModelInfo:
    """Basic model information returned by a provider."""
    provider_model_id: str
    display_name: str
    context_window: Optional[int] = None
    supports_streaming: bool = False
    supports_tools: bool = False
    supports_vision: bool = False


class AIProvider(ABC):
    """
    Abstract base class for all AI providers.
    Every provider (OpenAI, Anthropic, Gemini etc.) must implement this interface.
    Phase 1: Structure only. Actual API calls implemented in Phase 3+.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Unique identifier for this provider e.g. 'openai', 'anthropic'."""
        ...

    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable name e.g. 'OpenAI', 'Anthropic'."""
        ...

    @abstractmethod
    def validate_configuration(self) -> bool:
        """Check if provider is configured correctly (e.g. API key present)."""
        ...

    @abstractmethod
    def list_models(self) -> List[ModelInfo]:
        """Return list of models available from this provider."""
        ...

    def is_available(self) -> bool:
        """Check if provider is ready to use."""
        try:
            return self.validate_configuration()
        except Exception:
            return False