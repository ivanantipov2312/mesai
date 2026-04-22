from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class ProgrammeUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    target_ects: Optional[int] = None
    graduation_date: Optional[date] = None


class ProgrammeResponse(BaseModel):
    code: Optional[str]
    name: Optional[str]
    target_ects: int
    graduation_date: Optional[date]
    enrolled_ects: float
    enrolled_count: int

    class Config:
        from_attributes = True


class SyllabusResponse(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
