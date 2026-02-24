from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Union
from urllib.parse import urlparse


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """

    # =======================
    # DATABASE
    # =======================
    database_url: str = Field(..., alias="DATABASE_URL")

    # =======================
    # AUTH / JWT
    # =======================
    better_auth_secret: str = Field(..., alias="BETTER_AUTH_SECRET")
    jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
    jwt_expiry_days: int = Field(7, alias="JWT_EXPIRY_DAYS")  # JWT expiry in days

    # # =======================
    # # APPLICATION
    # # =======================
    # env: str = Field("development", alias="ENV")
    # api_port: int = Field(8000, alias="API_PORT")

    # =======================
    # API
    # =======================
    api_v1_prefix: str = "/api/v1"
    debug: bool = True
    project_name: str = "Todo API"
    version: str = "1.0.0"
    api_docs_enabled: bool = True

    # =======================
    # AI MODEL PROVIDER
    # =======================
    openrouter_api_key: str = Field(..., alias="OPENROUTER_API_KEY")  # Required
    openrouter_model_name: str = Field(
        "arcee-ai/trinity-large-preview", alias="OPENROUTER_MODEL_NAME"
    )  # Updated to use compatible OpenRouter model
    openrouter_base_url: str = Field(
        "https://openrouter.ai/api/v1", alias="OPENROUTER_BASE_URL"
    )  # Configurable base URL

    # =======================
    # CORS
    # =======================
    backend_cors_origins: Union[List[str], str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:8000"],
        alias="BACKEND_CORS_ORIGINS",
    )

    @property
    def cors_origins(self) -> List[str]:
        """
        CORS origins must be explicitly provided via environment variables.
        Supports both JSON lists and comma-separated strings.
        Always returns a list of strings.
        """
        if not self.backend_cors_origins:
            return ["http://localhost:3000", "http://localhost:8000"]

        # If it's a single string with commas or brackets, try to parse it
        if isinstance(self.backend_cors_origins, str):
            val = self.backend_cors_origins.strip()
            # If it looks like a JSON list, we might want to json.loads it,
            # but simple split is usually enough for comma-separated vals.
            if val.startswith("[") and val.endswith("]"):
                import json

                try:
                    return json.loads(val)
                except Exception:
                    pass

            return [origin.strip() for origin in val.split(",") if origin.strip()]

        # If it's already a list, return it
        return list(self.backend_cors_origins)

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore",  # ignore extra env vars
    }


# SINGLE settings instance
settings = Settings()


# =======================
# VALIDATION
# =======================


def is_valid_database_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme.startswith("postgresql") and parsed.netloc != ""
    except Exception:
        return False


# Validate DB URL early (fail fast)
if not is_valid_database_url(settings.database_url):
    raise ValueError(f"Invalid DATABASE_URL: {settings.database_url}")

# Enforce secret in production
# if settings.env == "production" and not settings.better_auth_secret:
#     raise ValueError("BETTER_AUTH_SECRET must be set in production")
