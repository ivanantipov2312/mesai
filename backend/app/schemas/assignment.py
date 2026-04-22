from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssignmentBase(BaseModel):
    title: str
    due_date: datetime
    risk_level: str = "Medium"
    description: Optional[str] = None
    course_id: Optional[int] = None

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentResponse(AssignmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
