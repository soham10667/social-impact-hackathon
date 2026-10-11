import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PrepPilot AI"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/preppilot")
    SUPABASE_URL: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    
    # AI & Services
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ONECOMPILER_API_URL: str = os.getenv("ONECOMPILER_API_URL", "https://api.onecompiler.com/v1/run")
    ONECOMPILER_API_KEY: str = os.getenv("ONECOMPILER_API_KEY", "")
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
