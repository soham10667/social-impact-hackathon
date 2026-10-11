import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PrepPilot AI"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/preppilot")
    SUPABASE_URL: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    
    # AI & Services (Mistral AI Reasoning Engine & Deepgram Voice)
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    MISTRAL_MODEL: str = os.getenv("MISTRAL_MODEL", "mistral-small-latest")
    MISTRAL_API_URL: str = os.getenv("MISTRAL_API_URL", "https://api.mistral.ai/v1/chat/completions")
    ONECOMPILER_API_URL: str = os.getenv("ONECOMPILER_API_URL", "https://api.onecompiler.com/v1/run")
    ONECOMPILER_API_KEY: str = os.getenv("ONECOMPILER_API_KEY", "")
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    DEEPGRAM_AGENT_URL: str = os.getenv("DEEPGRAM_AGENT_URL", "wss://agent.deepgram.com/v1/agent/converse")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
