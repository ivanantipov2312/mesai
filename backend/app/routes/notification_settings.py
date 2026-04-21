from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.notification_settings import NotificationSettings
from app.schemas.settings import NotificationSettingsUpdate, NotificationSettingsResponse

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _get_or_create(user_id: int, db: Session) -> NotificationSettings:
    ns = db.query(NotificationSettings).filter(NotificationSettings.user_id == user_id).first()
    if not ns:
        ns = NotificationSettings(user_id=user_id, method=["in_app"], reminder_minutes=15, apply_to="both")
        db.add(ns)
        db.commit()
        db.refresh(ns)
    return ns


@router.get("/notifications", response_model=NotificationSettingsResponse)
def get_notification_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_or_create(current_user.id, db)


@router.put("/notifications", response_model=NotificationSettingsResponse)
def update_notification_settings(
    body: NotificationSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ns = _get_or_create(current_user.id, db)
    ns.method = body.method
    ns.reminder_minutes = body.reminder_minutes
    ns.apply_to = body.apply_to
    db.commit()
    db.refresh(ns)
    return ns
