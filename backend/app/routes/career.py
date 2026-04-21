from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.career_path import CareerPath
from app.models.skill import Skill
from app.models.user_course import UserCourse
from app.models.user import User
from app.schemas.career import CareerPathResponse, CareerMatchResponse, SkillMatchDetail, SkillGapDetail
from app.services.skill_mapper import compute_skill_levels
from app.services.career_matcher import top_career_matches
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/careers", tags=["careers"])


@router.get("", response_model=List[CareerPathResponse])
def list_careers(db: Session = Depends(get_db)):
    return db.query(CareerPath).order_by(CareerPath.title).all()


@router.get("/match", response_model=List[CareerMatchResponse])
def career_match(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_courses = db.query(UserCourse).filter(UserCourse.user_id == current_user.id).all()
    enrolled_courses = [uc.course for uc in user_courses]
    all_skills = db.query(Skill).all()
    all_careers = db.query(CareerPath).all()

    skill_levels_map = compute_skill_levels(current_user, enrolled_courses, all_skills)
    user_skill_levels = {k: v["level"] for k, v in skill_levels_map.items()}

    matches = top_career_matches(all_careers, user_skill_levels, top_n=3)

    return [
        CareerMatchResponse(
            career=m["career"],
            match_pct=m["pct"],
            matched_skills={k: SkillMatchDetail(**v) for k, v in m["matched"].items()},
            missing_skills={k: SkillGapDetail(**v) for k, v in m["missing"].items()},
        )
        for m in matches
    ]
