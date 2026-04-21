from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    color: str = "#6366F1"


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    color: Optional[str] = None


class NoteResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    start_time: datetime
    end_time: datetime
    color: str
    created_at: datetime

    class Config:
        from_attributes = True
