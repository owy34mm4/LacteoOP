from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    mongo_db: str = "lacteoop"

    model_config = {"env_prefix": ""}
