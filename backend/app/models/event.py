from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime, timezone
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    location = Column(String, nullable=True)
    description = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    source = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
