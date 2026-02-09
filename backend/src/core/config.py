from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
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

    # =======================
    # APPLICATION
    # =======================
    env: str = Field("development", alias="ENV")
    api_port: int = Field(8000, alias="API_PORT")

    # =======================
    # API
    # =======================
    api_v1_prefix: str = "/api/v1"
    debug: bool = True
    project_name: str = "Todo API"
    version: str = "1.0.0"
    api_docs_enabled: bool = True

    # =======================
    # CORS
    # =======================
    backend_cors_origins: List[str] = Field(default_factory=list)

    # @property
    # def cors_origins(self) -> List[str]:
    #     """
    #     CORS origins must be explicitly provided via environment variables.
    #     No hardcoded URLs. No wildcards in production.
    #     """
    #     if not self.backend_cors_origins:
    #         raise ValueError("BACKEND_CORS_ORIGINS must be set")

    #     if self.env == "production" and "*" in self.backend_cors_origins:
    #         raise ValueError("Wildcard CORS is not allowed in production")

    #     return self.backend_cors_origins

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
if settings.env == "production" and not settings.better_auth_secret:
    raise ValueError("BETTER_AUTH_SECRET must be set in production")
