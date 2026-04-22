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


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    program: Optional[str] = None
    semester: Optional[int] = None
    career_interests: Optional[List[str]] = None
    existing_skills: Optional[List[str]] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str] = None
    program: Optional[str]
    semester: Optional[int]
    career_interests: List[str]
    existing_skills: List[str]
    created_at: datetime

    class Config:
        from_attributes = True
