from pydantic import BaseModel
from typing import List


class NotificationSettingsUpdate(BaseModel):
    method: List[str]
    reminder_minutes: int
    reminder_frequency: str = "medium"   # "high" | "medium" | "low"
    apply_to: str


class NotificationSettingsResponse(BaseModel):
    method: List[str]
    reminder_minutes: int
    reminder_frequency: str
    apply_to: str

    class Config:
        from_attributes = True
