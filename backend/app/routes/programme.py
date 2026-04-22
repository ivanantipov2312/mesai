import io
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.programme import UserProgramme
from app.models.syllabus import Syllabus
from app.models.user_course import UserCourse
from app.schemas.programme import ProgrammeUpdate, ProgrammeResponse, SyllabusResponse

router = APIRouter(prefix="/api/programme", tags=["programme"])


def _get_or_create_programme(user_id: int, db: Session) -> UserProgramme:
    p = db.query(UserProgramme).filter(UserProgramme.user_id == user_id).first()
    if not p:
        p = UserProgramme(user_id=user_id, target_ects=180)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def _extract_text(file_bytes: bytes, filename: str) -> str:
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
    return file_bytes.decode("utf-8", errors="replace")


@router.get("", response_model=ProgrammeResponse)
def get_programme(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = _get_or_create_programme(current_user.id, db)
    enrollments = db.query(UserCourse).filter(UserCourse.user_id == current_user.id).all()
    enrolled_ects = sum((uc.course.ects or 0) for uc in enrollments if uc.course)
    return ProgrammeResponse(
        code=p.code,
        name=p.name,
        target_ects=p.target_ects or 180,
        graduation_date=p.graduation_date,
        enrolled_ects=enrolled_ects,
        enrolled_count=len(enrollments),
    )


@router.put("", response_model=ProgrammeResponse)
def update_programme(
    body: ProgrammeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    p = _get_or_create_programme(current_user.id, db)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    enrollments = db.query(UserCourse).filter(UserCourse.user_id == current_user.id).all()
    enrolled_ects = sum((uc.course.ects or 0) for uc in enrollments if uc.course)
    return ProgrammeResponse(
        code=p.code, name=p.name, target_ects=p.target_ects or 180,
        graduation_date=p.graduation_date,
        enrolled_ects=enrolled_ects, enrolled_count=len(enrollments),
    )


@router.get("/syllabi", response_model=List[SyllabusResponse])
def list_syllabi(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Syllabus).filter(Syllabus.user_id == current_user.id).order_by(Syllabus.uploaded_at.desc()).all()


@router.post("/syllabi", response_model=SyllabusResponse)
async def upload_syllabus(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    raw = await file.read()
    text = _extract_text(raw, file.filename)
    s = Syllabus(user_id=current_user.id, filename=file.filename, content_text=text)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.delete("/syllabi/{syllabus_id}", status_code=204)
def delete_syllabus(
    syllabus_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from fastapi import HTTPException
    s = db.query(Syllabus).filter(Syllabus.id == syllabus_id, Syllabus.user_id == current_user.id).first()
    if not s:
        raise HTTPException(404, "Not found")
    db.delete(s)
    db.commit()
