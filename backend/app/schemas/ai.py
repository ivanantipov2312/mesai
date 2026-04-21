from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class CourseFeedbackRequest(BaseModel):
    course_id: int
    action: str  # "add" | "remove"


class CourseFeedbackResponse(BaseModel):
    feedback: str
    course_name: str


class DailyTipResponse(BaseModel):
    tip: str
    cached: bool
