from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.assignment import AssignmentCreate, AssignmentResponse
from app.services.assignment_service import create_assignment, get_user_assignments

router = APIRouter(prefix="/api/assignments", tags=["assignments"])

@router.get("/", response_model=List[AssignmentResponse])
def list_assignments(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get all assignments for the logged-in student."""
    return get_user_assignments(db, current_user.id)

@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def add_new_assignment(
    body: AssignmentCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Create a new assignment manually via the API."""
    return create_assignment(db, current_user.id, body)
