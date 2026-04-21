from pydantic import BaseModel
from typing import Dict, List, Optional


class SkillResponse(BaseModel):
    id: int
    skill_id: str
    name: str
    category: str
    description: Optional[str]
    levels: Dict[str, str]

    class Config:
        from_attributes = True


class UserSkillLevel(BaseModel):
    skill_id: str
    name: str
    category: str
    level: int        # 0–5, computed from enrolled courses
    sources: List[str]  # course codes that teach this skill


class SkillGap(BaseModel):
    skill_id: str
    name: str
    category: str
    current_level: int
    required_level: int
    gap: int
    courses_to_close: List[dict]  # courses that teach this skill
