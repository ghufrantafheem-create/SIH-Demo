from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = 'sqlite:///./app.db'
    jwt_secret: str = 'sih26120-development-secret'
    cors_origins: str = 'http://localhost:5173'

    class Config:
        env_file = '.env'


settings = Settings()
