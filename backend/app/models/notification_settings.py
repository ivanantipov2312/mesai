from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    method = Column(JSON, default=list)           # ["email", "sms", "in_app"]
    reminder_minutes = Column(Integer, default=15)
    reminder_frequency = Column(String, default="medium")  # "high" | "medium" | "low"
    apply_to = Column(String, default="both")     # "courses" | "notes" | "both"

    user = relationship("User", back_populates="notification_settings")
