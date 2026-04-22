from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class CourseFeedback(Base):
    __tablename__ = "course_feedback"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    username = Column(String, nullable=False)
    is_positive = Column(Boolean, nullable=False)
    text = Column(Text, nullable=False)
    semester = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    upvotes = Column(JSON, default=list, nullable=False)
    downvotes = Column(JSON, default=list, nullable=False)

    course = relationship("Course")
    user = relationship("User")
