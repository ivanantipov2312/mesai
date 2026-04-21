from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    program: Optional[str] = None
    semester: Optional[int] = None
    career_interests: List[str] = []
    existing_skills: List[str] = []


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    program: Optional[str]
    semester: Optional[int]
    career_interests: List[str]
    existing_skills: List[str]
    created_at: datetime

    class Config:
        from_attributes = True
