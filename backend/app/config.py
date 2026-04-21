import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME = "Smart Timetable AI"
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")

    AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
    AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")

settings = Settings()
