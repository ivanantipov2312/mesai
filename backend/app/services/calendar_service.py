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

def delete_calendar_note_db(db: Session, user_id: int, identifier: str):
# 1. Try to see if 'identifier' is a numeric ID
    if identifier.isdigit():
        note = db.query(CalendarNote).filter(CalendarNote.id == int(identifier), CalendarNote.user_id == user_id).first()
    else:
        # 2. Case-insensitive search for a note with a similar title
        note = db.query(CalendarNote).filter(
            CalendarNote.user_id == user_id,
            CalendarNote.title.ilike(f"%{identifier}%")
        ).order_by(CalendarNote.start_time.desc()).first()

    if not note:
        return {"status": "error", "message": f"I couldn't find a note matching '{identifier}'."}

    title = note.title
    db.delete(note)
    db.commit()
    return {"status": "success", "title": title}
