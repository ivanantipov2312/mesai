from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.event import Event
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/events", tags=["events"])


class EventResponse(BaseModel):
    id: int
    title: str
    date: datetime
    location: str | None
    description: str | None
    tags: list
    source: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[EventResponse])
def list_events(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Event).order_by(Event.date).all()
