from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.course import Course
from app.models.user_course import UserCourse
from app.models.user import User
from app.schemas.courses import CourseResponse, EnrollRequest, EnrolledCourseResponse, ConflictResponse
from app.dependencies import get_current_user
from app.services.course_service import enroll_student_in_db

router = APIRouter(prefix="/api/courses", tags=["courses"])


def _time_to_minutes(t: str) -> int:
    h, m = t.split(":")
    return int(h) * 60 + int(m)


def _slots_overlap(slot_a: dict, slot_b: dict) -> bool:
    if slot_a["day"] != slot_b["day"]:
        return False
    a_start = _time_to_minutes(slot_a["start"])
    a_end = _time_to_minutes(slot_a["end"])
    b_start = _time_to_minutes(slot_b["start"])
    b_end = _time_to_minutes(slot_b["end"])
    return a_start < b_end and b_start < a_end


def _find_conflicts(courses: List[Course]) -> List[dict]:
    conflicts = []
    for i, ca in enumerate(courses):
        for cb in courses[i + 1:]:
            for slot_a in (ca.schedule or []):
                for slot_b in (cb.schedule or []):
                    if _slots_overlap(slot_a, slot_b):
                        conflicts.append({
                            "course_a": {"id": ca.id, "code": ca.code, "name": ca.name},
                            "course_b": {"id": cb.id, "code": cb.code, "name": cb.name},
                            "day": slot_a["day"],
                            "time": f"{slot_a['start']}–{slot_a['end']}",
                        })
    return conflicts


@router.get("", response_model=List[CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).order_by(Course.code).all()


@router.get("/my", response_model=List[EnrolledCourseResponse])
def my_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(UserCourse)
        .filter(UserCourse.user_id == current_user.id)
        .all()
    )


@router.get("/debug-catalog")
def get_debug_catalog(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    # Format it exactly how the Agent needs to see it
    return [f"ID {c.id}: {c.name} ({c.code})" for c in courses]

@router.post("/enroll", response_model=EnrolledCourseResponse, status_code=status.HTTP_201_CREATED)
def enroll(body: EnrollRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = enroll_student_in_db(
        db=db, 
        course_id=body.course_id, 
        user_id=current_user.id
    )
    
    # 2. Handle the "already enrolled" case to match your 409 logic
    if result["status"] == "already_enrolled":
        raise HTTPException(status_code=409, detail="Already enrolled")
        
    # 3. Return the data
    # If your EnrolledCourseResponse expects the UserCourse (uc) object:
    # Note: You might need to adjust your service to return the 'uc' object 
    # instead of 'course' if your frontend needs the enrollment ID.
    return result["course"]


@router.delete("/unenroll/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def unenroll(course_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    uc = (
        db.query(UserCourse)
        .filter(UserCourse.user_id == current_user.id, UserCourse.course_id == course_id)
        .first()
    )
    if not uc:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(uc)
    db.commit()


@router.get("/conflicts", response_model=ConflictResponse)
def check_conflicts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_courses = (
        db.query(UserCourse)
        .filter(UserCourse.user_id == current_user.id)
        .all()
    )
    courses = [uc.course for uc in user_courses]
    conflicts = _find_conflicts(courses)
    return ConflictResponse(has_conflicts=bool(conflicts), conflicts=conflicts)
