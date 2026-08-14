import secrets
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"

    # Signing key for JWTs. In production this MUST be provided via the
    # SECRET_KEY env var. If it isn't set we generate a random per-process
    # key so we never fall back to a public, hardcoded constant. Tokens will
    # not survive a restart in that case, which is fine for local dev.
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DATABASE_URL: str = "sqlite:///./test.db"

    # Alpha Vantage API key. Provide via ALPHA_VANTAGE_API_KEY env var.
    # The "demo" key only works for a handful of sample symbols; set a real
    # key (free at https://www.alphavantage.co/support/#api-key) for real data.
    ALPHA_VANTAGE_API_KEY: str = "demo"

    # Finance news. Optional and free. If FINNHUB_API_KEY is set it's preferred
    # for the news feed (a generous free tier that doesn't spend the tiny Alpha
    # Vantage quota); otherwise the feed falls back to Alpha Vantage's
    # NEWS_SENTIMENT (shares the ~25/day budget), then to a labelled snapshot.
    FINNHUB_API_KEY: str = ""

    # Exact-match allowed origins. Wildcard hosts (e.g. Vercel preview URLs)
    # are handled separately via BACKEND_CORS_ORIGIN_REGEX below.
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://ai-financial-market-prediction-system.vercel.app",
    ]

    # Starlette matches allow_origins by exact string, so glob patterns like
    # "https://*.vercel.app" never match. Use a regex for wildcard hosts.
    BACKEND_CORS_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            # Support both JSON array and comma-separated env values.
            if v.startswith("["):
                import json

                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
