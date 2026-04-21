from sqlalchemy import Column, Integer, String, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    ects = Column(Float, nullable=False)
    semester = Column(String, nullable=True)  # "Fall", "Spring", "Both"
    description = Column(String, nullable=True)
    schedule = Column(JSON, default=list)       # [{day, start, end, type}]
    prerequisites = Column(JSON, default=list)  # [course_code, ...]
    skills_taught = Column(JSON, default=list)  # [skill_id, ...]

    enrolled_by = relationship("UserCourse", back_populates="course", cascade="all, delete-orphan")
