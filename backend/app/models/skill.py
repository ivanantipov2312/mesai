from sqlalchemy import Column, Integer, String, JSON
from app.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    levels = Column(JSON, default=dict)  # {"1": "...", "3": "...", "5": "..."}
