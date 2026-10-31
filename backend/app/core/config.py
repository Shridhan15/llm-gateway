# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str
    VERSION: str
    REDIS_URL: str
    GROQ_API_KEY: str

    # This tells Pydantic to look for the .env file in the root directory
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Instantiate the settings object so it can be imported across the app
settings = Settings()