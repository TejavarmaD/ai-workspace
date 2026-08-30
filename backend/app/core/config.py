import os
from functools import lru_cache
from typing import List


class Settings:
    def __init__(self):
        self.app_name: str = os.getenv("APP_NAME", "AI Workspace")
        self.app_env: str = os.getenv("APP_ENV", "development")
        self.app_debug: bool = os.getenv("APP_DEBUG", "false").lower() == "true"
        self.secret_key: str = os.getenv("SECRET_KEY", "change-this-secret-key")
        self.database_url: str = os.getenv(
            "DATABASE_URL",
            "postgresql://aiworkspace:aiworkspace@localhost:5432/aiworkspace"
        )
        self.redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._cors_origins_raw: str = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000"
        )
        self.openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
        self.anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
        self.google_api_key: str = os.getenv("GOOGLE_API_KEY", "")
        self.xai_api_key: str = os.getenv("XAI_API_KEY", "")
        self.deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
        self.mistral_api_key: str = os.getenv("MISTRAL_API_KEY", "")
        self.cohere_api_key: str = os.getenv("COHERE_API_KEY", "")
        self.perplexity_api_key: str = os.getenv("PERPLEXITY_API_KEY", "")
        self.openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
        self.huggingface_api_key: str = os.getenv("HUGGINGFACE_API_KEY", "")
        self.ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.vllm_base_url: str = os.getenv("VLLM_BASE_URL", "http://localhost:8000")

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self._cors_origins_raw.split(",")]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


def _load_env():
    env_path = "/workspaces/ai-workspace/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())


_load_env()


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()