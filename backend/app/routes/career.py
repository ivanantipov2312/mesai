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


import io
from fastapi import UploadFile, File, Form
from typing import Optional as Opt


def _extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            return f"[PDF parse error: {e}]"
    elif name.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception as e:
            return f"[DOCX parse error: {e}]"
    else:
        return file_bytes.decode("utf-8", errors="replace")


CV_ANALYSIS_PROMPT = """Analyze the following CV/resume text. Return a structured plain-text analysis with these exact sections:

SKILLS FOUND:
List each skill on its own line with a bullet point.

CAREER MATCHES:
List the top 3 career matches from this list: SOC Analyst, Penetration Tester, Security Engineer, Software Developer, DevOps Engineer, Data Analyst, IT Systems Admin, Cloud Security Engineer.
Format each as: Career Name — XX% match
Explain briefly why.

SKILL GAPS:
List the most important missing skills for the top matched career.

RECOMMENDED COURSES:
From TalTech's offerings (ICS/ITC/ICA catalog), list 3-5 specific courses that would help close the gaps.

Keep each section concise. Use plain text only, no markdown.

CV TEXT:
"""


@router.post("/analyze-cv")
async def analyze_cv(
    file: Opt[UploadFile] = File(None),
    text: Opt[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.azure_openai import chat_completion, SYSTEM_PROMPT

    if file and file.filename:
        raw = await file.read()
        cv_text = _extract_text_from_file(raw, file.filename)
    elif text:
        cv_text = text
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Provide a file or text")

    if not cv_text.strip():
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Could not extract text from file")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": CV_ANALYSIS_PROMPT + cv_text[:6000]},
    ]
    analysis = chat_completion(messages, max_tokens=1400)
    return {"analysis": analysis, "cv_length": len(cv_text)}
