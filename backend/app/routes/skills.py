from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.skill import Skill
from app.models.user_course import UserCourse
from app.models.career_path import CareerPath
from app.models.user import User
from app.schemas.skills import SkillResponse, UserSkillLevel, SkillGap
from app.services.skill_mapper import compute_skill_levels
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("", response_model=List[SkillResponse])
def list_skills(db: Session = Depends(get_db)):
    return db.query(Skill).order_by(Skill.category, Skill.name).all()


@router.get("/my", response_model=List[UserSkillLevel])
def my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_courses = db.query(UserCourse).filter(UserCourse.user_id == current_user.id).all()
    enrolled_courses = [uc.course for uc in user_courses]
    all_skills = db.query(Skill).all()

    levels = compute_skill_levels(current_user, enrolled_courses, all_skills)
    return [UserSkillLevel(**v) for v in levels.values()]


@router.get("/gaps", response_model=List[SkillGap])
def skill_gaps(
    career_id: Optional[str] = Query(None, description="Target career_id; defaults to user's first career interest"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Resolve target career
    target_id = career_id or (
        current_user.career_interests[0] if current_user.career_interests else None
    )
    if not target_id:
        return []

    career = db.query(CareerPath).filter(CareerPath.career_id == target_id).first()
    if not career:
        return []

    user_courses = db.query(UserCourse).filter(UserCourse.user_id == current_user.id).all()
    enrolled_courses = [uc.course for uc in user_courses]
    all_skills = db.query(Skill).all()

    from app.models.course import Course as CourseModel
    all_courses_list = db.query(CourseModel).all()

    levels = compute_skill_levels(current_user, enrolled_courses, all_skills)
    skill_map = {s.skill_id: s for s in all_skills}

    gaps = []
    for skill_id, required_level in (career.required_skills or {}).items():
        current = levels.get(skill_id, {}).get("level", 0)
        gap = required_level - current
        if gap > 0:
            skill = skill_map.get(skill_id)
            if not skill:
                continue
            # Find courses that teach this skill and aren't enrolled yet
            enrolled_ids = {uc.course_id for uc in user_courses}
            closing_courses = [
                {"id": c.id, "code": c.code, "name": c.name, "ects": c.ects}
                for c in all_courses_list
                if skill_id in (c.skills_taught or []) and c.id not in enrolled_ids
            ]
            gaps.append(SkillGap(
                skill_id=skill_id,
                name=skill.name,
                category=skill.category,
                current_level=current,
                required_level=required_level,
                gap=gap,
                courses_to_close=closing_courses,
            ))

    return sorted(gaps, key=lambda g: g.gap, reverse=True)
