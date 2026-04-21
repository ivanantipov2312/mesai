from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.calendar_note import CalendarNote
from app.schemas.calendar import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


@router.get("/notes", response_model=List[NoteResponse])
def list_notes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(CalendarNote).filter(CalendarNote.user_id == current_user.id).all()


@router.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(body: NoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = CalendarNote(user_id=current_user.id, **body.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, body: NoteUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(CalendarNote).filter(CalendarNote.id == note_id, CalendarNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(CalendarNote).filter(CalendarNote.id == note_id, CalendarNote.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
