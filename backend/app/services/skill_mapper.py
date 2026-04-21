"""
Maps enrolled courses + existing_skills → skill levels.

Level calculation:
  - Each course that teaches a skill contributes +2 levels (capped at 5).
  - Skills in user.existing_skills start at level 2.
  - Existing skill + 1 course = 4, + 2 courses = 5.
"""
from typing import List, Dict
from app.models.course import Course
from app.models.skill import Skill
from app.models.user import User


COURSE_SKILL_CONTRIBUTION = 2
EXISTING_SKILL_BASE = 2


def compute_skill_levels(
    user: User,
    enrolled_courses: List[Course],
    all_skills: List[Skill],
) -> Dict[str, dict]:
    """Returns {skill_id: {level, sources, name, category}}"""
    skill_map = {s.skill_id: s for s in all_skills}
    levels: Dict[str, dict] = {}

    # Seed from existing skills
    for skill_id in (user.existing_skills or []):
        if skill_id in skill_map:
            s = skill_map[skill_id]
            levels[skill_id] = {
                "skill_id": skill_id,
                "name": s.name,
                "category": s.category,
                "level": EXISTING_SKILL_BASE,
                "sources": ["prior_knowledge"],
            }

    # Add from courses
    for course in enrolled_courses:
        for skill_id in (course.skills_taught or []):
            if skill_id not in skill_map:
                continue
            s = skill_map[skill_id]
            if skill_id not in levels:
                levels[skill_id] = {
                    "skill_id": skill_id,
                    "name": s.name,
                    "category": s.category,
                    "level": 0,
                    "sources": [],
                }
            entry = levels[skill_id]
            entry["level"] = min(5, entry["level"] + COURSE_SKILL_CONTRIBUTION)
            entry["sources"].append(course.code)

    return levels
