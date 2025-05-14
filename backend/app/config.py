from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_TIME: int = 3600  # 1 hour
    GEMINI_API_KEY: str
    OCR_SPACE_API_KEY: str
    FRONTEND_URL: str
    FROM_EMAIL:str
    RESEND_API_KEY:str
    
    
    class Config:
        env_file = ".env"
        
settings = Settings()