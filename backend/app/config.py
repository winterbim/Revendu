import logging
from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql+asyncpg://revendu:revendu@localhost:5432/revendu"

    # JWT
    jwt_secret: str = "change-me-in-production-use-256-bit-random-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # App
    environment: Literal["development", "production", "staging", "test"] = "development"
    cors_origins: str = "http://localhost:3000"

    # Rate limiting
    rate_limit_login: str = "10/minute"

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_pro_price_id: str = ""

    # Frontend
    frontend_url: str = "http://localhost:3000"

    # Google OAuth (Gmail sync)
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/sync/gmail/callback"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_test(self) -> bool:
        return self.environment == "test"

    @field_validator("jwt_secret")
    @classmethod
    def validate_jwt_secret(cls, v: str, info) -> str:
        """Ensure JWT_SECRET is not the default placeholder in production."""
        if info.data.get("environment") == "production":
            if "change-me" in v.lower() or len(v) < 32:
                raise ValueError(
                    "JWT_SECRET must be a 256-bit random secret in production. "
                    "Set JWT_SECRET in .env or environment variables."
                )
        return v

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str, info) -> str:
        """Validate database URL format."""
        if info.data.get("environment") == "production":
            if "localhost" in v or "127.0.0.1" in v:
                raise ValueError(
                    "DATABASE_URL cannot point to localhost in production. "
                    "Set a proper production database URL."
                )
        return v

    @field_validator("stripe_webhook_secret")
    @classmethod
    def validate_stripe_webhook(cls, v: str, info) -> str:
        """Warn if Stripe webhook secret is not configured in production."""
        if info.data.get("environment") == "production":
            if not v or "whsec_" not in v:
                logger.warning(
                    "STRIPE_WEBHOOK_SECRET is not set — Stripe webhooks will be disabled. "
                    "Set it from your Stripe dashboard when ready."
                )
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
