import os

from pydantic_settings import BaseSettings, SettingsConfigDict

DOTENV = os.path.join(os.path.dirname(__file__), ".env")

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=DOTENV)
    admin_user: str = "admin"
    admin_password: str = "1234"
    jwt_secret: str = "hola"

