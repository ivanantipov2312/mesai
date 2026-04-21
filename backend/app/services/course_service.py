# app/services/course_service.py
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Course, UserCourse,User
from fastapi import Depends, HTTPException

from app.schemas.courses import EnrollRequest

def enroll_student_in_db(db: Session, course_id: int, user_id: int):
    # 1. Check if course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # 2. Check for existing enrollment
    existing = db.query(UserCourse).filter(
        UserCourse.user_id == user_id, 
        UserCourse.course_id == course_id
    ).first()
    
    if existing:
        return {"status": "already_enrolled", "course": course}

    new_enrollment = UserCourse(user_id=user_id, course_id=course_id)
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment) # This loads the 'course' relationship
    
    # Access the name via the relationship
    return {
        "status": "success", 
        "course_name": new_enrollment.course.name, 
        "course_code": new_enrollment.course.code,
        "data": new_enrollment
    }

def unenroll_student_from_db(db: Session, course_id: int, user_id: int):
    # 1. Find the enrollment record
    enrollment = db.query(UserCourse).filter(
        UserCourse.user_id == user_id,
        UserCourse.course_id == course_id
    ).first()

    if not enrollment:
        return {"status": "not_found", "message": "You aren't enrolled in this course."}

    # Capture details before deleting for the success message
    course_name = enrollment.course.name
    course_code = enrollment.course.code

    # 2. Delete the record
    db.delete(enrollment)
    db.commit()

    return {
        "status": "success",
        "course_name": course_name,
        "course_code": course_code
    }
