from pydantic import BaseModel
from typing import List


class NotificationSettingsUpdate(BaseModel):
    method: List[str]          # ["email", "sms", "in_app"]
    reminder_minutes: int
    apply_to: str              # "courses" | "notes" | "both"


class NotificationSettingsResponse(BaseModel):
    method: List[str]
    reminder_minutes: int
    apply_to: str

    class Config:
        from_attributes = True
