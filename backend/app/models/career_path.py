from sqlalchemy import Column, Integer, String, Float, Boolean, JSON
from app.database import Base


class CareerPath(Base):
    __tablename__ = "career_paths"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    required_skills = Column(JSON, default=dict)  # {skill_id: required_level}
    avg_salary_eur = Column(Integer, nullable=True)
    demand_level = Column(String, nullable=True)   # "High", "Medium", "Low"
    entry_level = Column(Boolean, default=True)
