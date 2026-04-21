"""
Calculates career match percentages locally — no AI needed.

Match score = sum of min(user_level, required_level) for each required skill
            / sum of required_level for all skills
"""
from typing import List, Dict
from app.models.career_path import CareerPath


def match_career(career: CareerPath, user_skill_levels: Dict[str, int]) -> dict:
    required = career.required_skills or {}
    if not required:
        return {"career": career, "pct": 0, "matched": {}, "missing": {}}

    total_required = sum(required.values())
    total_matched = sum(
        min(user_skill_levels.get(skill_id, 0), req_level)
        for skill_id, req_level in required.items()
    )

    pct = round((total_matched / total_required) * 100) if total_required else 0

    matched = {
        sid: {"user_level": user_skill_levels.get(sid, 0), "required": req}
        for sid, req in required.items()
        if user_skill_levels.get(sid, 0) >= req
    }
    missing = {
        sid: {"user_level": user_skill_levels.get(sid, 0), "required": req, "gap": req - user_skill_levels.get(sid, 0)}
        for sid, req in required.items()
        if user_skill_levels.get(sid, 0) < req
    }

    return {"career": career, "pct": pct, "matched": matched, "missing": missing}


def top_career_matches(
    careers: List[CareerPath],
    user_skill_levels: Dict[str, int],
    top_n: int = 3,
) -> List[dict]:
    results = [match_career(c, user_skill_levels) for c in careers]
    return sorted(results, key=lambda r: r["pct"], reverse=True)[:top_n]
