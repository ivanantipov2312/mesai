from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class UserProgramme(Base):
    __tablename__ = "user_programmes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    code = Column(String, nullable=True)
    name = Column(String, nullable=True)
    target_ects = Column(Integer, default=180)
    graduation_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="programme")
