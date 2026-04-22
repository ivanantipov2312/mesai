from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.feedback import CourseFeedback
from app.models.course import Course
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackStatsResponse, VoteRequest
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post("/{course_id}", response_model=FeedbackResponse)
def submit_feedback(
    course_id: int,
    body: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = (
        db.query(CourseFeedback)
        .filter(
            CourseFeedback.course_id == course_id,
            CourseFeedback.user_id == current_user.id,
            CourseFeedback.semester == body.semester,
        )
        .first()
    )

    if existing:
        existing.is_positive = body.is_positive
        existing.text = body.text
        db.commit()
        db.refresh(existing)
        return existing

    feedback = CourseFeedback(
        course_id=course_id,
        user_id=current_user.id,
        username=current_user.name or current_user.email,
        is_positive=body.is_positive,
        text=body.text,
        semester=body.semester,
        upvotes=[],
        downvotes=[],
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/{course_id}/stats", response_model=FeedbackStatsResponse)
def get_feedback_stats(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feedbacks = db.query(CourseFeedback).filter(CourseFeedback.course_id == course_id).all()
    total = len(feedbacks)
    positive_count = sum(1 for f in feedbacks if f.is_positive)
    negative_count = total - positive_count
    positive_pct = round(positive_count / total * 100, 1) if total > 0 else 0.0
    return FeedbackStatsResponse(
        total=total,
        positive_count=positive_count,
        negative_count=negative_count,
        positive_pct=positive_pct,
    )


@router.get("/{course_id}", response_model=List[FeedbackResponse])
def get_feedback(
    course_id: int,
    semester: Optional[str] = Query(None),
    sort: str = Query("helpful"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(CourseFeedback).filter(CourseFeedback.course_id == course_id)
    if semester:
        q = q.filter(CourseFeedback.semester == semester)
    feedbacks = q.all()

    if sort == "recent":
        feedbacks.sort(key=lambda f: f.created_at, reverse=True)
    else:
        feedbacks.sort(key=lambda f: len(f.upvotes or []) - len(f.downvotes or []), reverse=True)

    return feedbacks


@router.post("/{feedback_id}/vote", response_model=FeedbackResponse)
def vote_feedback(
    feedback_id: int,
    body: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    feedback = db.query(CourseFeedback).filter(CourseFeedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if feedback.user_id == current_user.id:
        raise HTTPException(status_code=403, detail="Cannot vote on your own review")

    uid = current_user.id
    upvotes = list(feedback.upvotes or [])
    downvotes = list(feedback.downvotes or [])

    if body.vote == "up":
        if uid in upvotes:
            upvotes.remove(uid)
        else:
            upvotes.append(uid)
            if uid in downvotes:
                downvotes.remove(uid)
    else:
        if uid in downvotes:
            downvotes.remove(uid)
        else:
            downvotes.append(uid)
            if uid in upvotes:
                upvotes.remove(uid)

    feedback.upvotes = upvotes
    feedback.downvotes = downvotes
    db.commit()
    db.refresh(feedback)
    return feedback
