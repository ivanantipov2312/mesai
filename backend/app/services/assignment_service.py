from sqlalchemy.orm import Session
from app.models.assignment import Assignment
from app.schemas.assignment import AssignmentCreate

def create_assignment(db: Session, user_id: int, data: AssignmentCreate):
    new_assignment = Assignment(
        user_id=user_id,
        **data.model_dump()
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

def get_user_assignments(db: Session, user_id: int):
    return db.query(Assignment).filter(Assignment.user_id == user_id).order_by(Assignment.due_date.asc()).all()
