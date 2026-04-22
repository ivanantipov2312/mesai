from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ScheduleSlot(BaseModel):
    day: str
    start: str
    end: str
    type: str


class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    ects: float
    semester: Optional[str]
    description: Optional[str]
    schedule: List[dict]
    prerequisites: List[str]
    skills_taught: List[str]
    source: Optional[str] = "taltech"

    class Config:
        from_attributes = True


class EnrollRequest(BaseModel):
    course_id: int


class EnrolledCourseResponse(BaseModel):
    id: int
    course: CourseResponse
    added_at: datetime

    class Config:
        from_attributes = True


class ConflictResponse(BaseModel):
    has_conflicts: bool
    conflicts: List[dict]  # [{course_a, course_b, day, time}]
