from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    program = Column(String, nullable=True)
    semester = Column(Integer, nullable=True)
    career_interests = Column(JSON, default=list)
    existing_skills = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    assignments = relationship("Assignment", back_populates="user", cascade="all, delete-orphan")
    enrolled_courses = relationship("UserCourse", back_populates="user", cascade="all, delete-orphan")
    ai_cache_entries = relationship("AICache", back_populates="user", cascade="all, delete-orphan")
    calendar_notes = relationship("CalendarNote", back_populates="user", cascade="all, delete-orphan")
    notification_settings = relationship("NotificationSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
