from typing import Dict, List, Optional, Type
from backend.app.providers.base import AIProvider
from backend.app.core.logging import get_logger

logger = get_logger(__name__)


class ProviderRegistry:
    """
    Central registry for all AI provider adapters.
    Phase 1: Structure only.
    Phase 3+: Providers will be instantiated and queried for real.
    """

    def __init__(self) -> None:
        self._providers: Dict[str, AIProvider] = {}

    def register(self, provider: AIProvider) -> None:
        """Register a provider instance."""
        name = provider.provider_name
        self._providers[name] = provider
        logger.info("Provider registered", provider=name)

    def get(self, name: str) -> Optional[AIProvider]:
        """Get a provider by name."""
        return self._providers.get(name)

    def list_all(self) -> List[Dict]:
        """List all registered providers with their status."""
        return [
            {
                "name": p.provider_name,
                "display_name": p.display_name,
                "is_available": p.is_available(),
            }
            for p in self._providers.values()
        ]

    def list_available(self) -> List[AIProvider]:
        """Return only providers that are configured and available."""
        return [p for p in self._providers.values() if p.is_available()]


# Global registry instance
provider_registry = ProviderRegistry()