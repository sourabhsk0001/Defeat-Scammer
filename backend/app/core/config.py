import os

class Settings:
    PROJECT_NAME: str = "Defeat Scammer AI & Financial Guardian"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment variables
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/defeat_scammer.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-defeat-scammer-key-2026")
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]

settings = Settings()
