from pydantic_settings import BaseSettings
from typing import List
import re


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/raya_ecommerce"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Ollama / AI Agent configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"

    # JWT Authentication configuration
    JWT_SECRET: str = "raya_atelier_super_secret_jwt_key_development_2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def sanitized_database_url(self) -> str:
        """Returns the database URL with password masked for safe logging/display."""
        return re.sub(r":([^:@]+)@", r":***@", self.DATABASE_URL)


settings = Settings()
