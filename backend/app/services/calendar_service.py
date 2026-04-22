from sqlalchemy.orm import Session
from datetime import datetime
from app.models.calendar_note import CalendarNote

def create_calendar_note_db(db: Session, user_id: int, title: str, start_time: datetime, end_time: datetime, description = None):
    new_note = CalendarNote(
        user_id=user_id,
        title=title,
        start_time=start_time,
        end_time=end_time,
        description=description
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

def delete_calendar_note_db(db: Session, user_id: int, note_id: int):
    note = db.query(CalendarNote).filter(
        CalendarNote.id == note_id, 
        CalendarNote.user_id == user_id
    ).first()
    if note:
        db.delete(note)
        db.commit()
        return True
    return False
