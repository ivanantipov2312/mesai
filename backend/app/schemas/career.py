from pydantic import BaseModel
from typing import Dict, List, Optional


class CareerPathResponse(BaseModel):
    id: int
    career_id: str
    title: str
    description: Optional[str]
    required_skills: Dict[str, int]
    avg_salary_eur: Optional[int]
    demand_level: Optional[str]
    entry_level: bool

    class Config:
        from_attributes = True


class SkillMatchDetail(BaseModel):
    user_level: int
    required: int


class SkillGapDetail(BaseModel):
    user_level: int
    required: int
    gap: int


class CareerMatchResponse(BaseModel):
    career: CareerPathResponse
    match_pct: int
    matched_skills: Dict[str, SkillMatchDetail]
    missing_skills: Dict[str, SkillGapDetail]
