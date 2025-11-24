"""
Configuration module for loading environment variables
"""
import os

# Only load .env file if it exists (for local development)
# In Vercel, environment variables are set directly, not from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv not available, skip (Vercel uses environment variables directly)
    pass


class Config:
    """Application configuration"""
    
    # LINE API Configuration
    LINE_CHANNEL_ID = os.getenv("LINE_CHANNEL_ID", "")
    LINE_CHANNEL_SECRET = os.getenv("LINE_CHANNEL_SECRET", "")
    LINE_CHANNEL_ACCESS_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN", "")
    
    # LLM Configuration (Groq)
    LLM_API_KEY = os.getenv("LLM_API_KEY", "")
    LLM_API_BASE = os.getenv("LLM_API_BASE", "https://api.groq.com/openai/v1")
    
    # MongoDB Configuration
    MONGODB_URI = os.getenv("MONGODB_URI", "")
    
    # Application Configuration
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    @classmethod
    def validate(cls):
        """Validate that all required configuration is present"""
        required_vars = [
            "LINE_CHANNEL_ID",
            "LINE_CHANNEL_SECRET",
            "LINE_CHANNEL_ACCESS_TOKEN",
            "LLM_API_KEY",
            "MONGODB_URI"
        ]
        missing = [var for var in required_vars if not getattr(cls, var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        return True


