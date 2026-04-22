from pydantic import BaseModel
from datetime import datetime
from typing import Literal, List, Optional


class FeedbackCreate(BaseModel):
    is_positive: bool
    text: str
    semester: str


class VoteRequest(BaseModel):
    vote: Literal["up", "down"]


class FeedbackResponse(BaseModel):
    id: int
    course_id: int
    user_id: int
    username: str
    is_positive: bool
    text: str
    semester: str
    created_at: datetime
    upvotes: List[int] = []
    downvotes: List[int] = []

    class Config:
        from_attributes = True


class FeedbackStatsResponse(BaseModel):
    total: int
    positive_count: int
    negative_count: int
    positive_pct: float
