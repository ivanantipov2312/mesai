from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.user_course import UserCourse
from app.models.course import Course
import uuid

router = APIRouter(prefix="/api/timetable", tags=["timetable"])

DAY_MAP = {
    "Monday": "MO", "Tuesday": "TU", "Wednesday": "WE",
    "Thursday": "TH", "Friday": "FR", "Saturday": "SA", "Sunday": "SU",
}

# Semester start: 2025-09-01 (Monday)
SEMESTER_START = "20250901"


def _next_weekday(byday: str) -> str:
    """Return YYYYMMDD of first occurrence of byday on/after semester start."""
    day_offsets = {"MO": 0, "TU": 1, "WE": 2, "TH": 3, "FR": 4, "SA": 5, "SU": 6}
    from datetime import date
    start = date(2025, 9, 1)  # Monday
    offset = day_offsets.get(byday, 0)
    target = start.toordinal() + offset
    d = date.fromordinal(target)
    return d.strftime("%Y%m%d")


def _parse_time(t: str) -> str:
    """'9:00' or '09:00' → '090000'"""
    parts = t.strip().split(":")
    h = parts[0].zfill(2)
    m = parts[1].zfill(2) if len(parts) > 1 else "00"
    return f"{h}{m}00"


@router.get("/export.ics")
def export_ics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollments = (
        db.query(UserCourse)
        .filter(UserCourse.user_id == current_user.id)
        .all()
    )

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//MESA.I//Timetable//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:MESA.I Timetable",
        "X-WR-TIMEZONE:Europe/Tallinn",
    ]

    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if not course or not course.schedule:
            continue

        for slot in course.schedule:
            day_abbr = DAY_MAP.get(slot.get("day", ""), "MO")
            start_t = _parse_time(slot.get("start", "9:00"))
            end_t = _parse_time(slot.get("end", "10:00"))
            dt_start = _next_weekday(day_abbr)
            slot_type = slot.get("type", "Lecture")
            room = slot.get("room", "")

            location = f"LOCATION:{room}\r\n" if room else ""

            uid = str(uuid.uuid4())
            lines += [
                "BEGIN:VEVENT",
                f"UID:{uid}",
                f"DTSTART;TZID=Europe/Tallinn:{dt_start}T{start_t}",
                f"DTEND;TZID=Europe/Tallinn:{dt_start}T{end_t}",
                f"RRULE:FREQ=WEEKLY;BYDAY={day_abbr}",
                f"SUMMARY:{course.code} – {course.name} ({slot_type})",
                f"DESCRIPTION:{course.description or ''}",
            ]
            if room:
                lines.append(f"LOCATION:{room}")
            lines.append("END:VEVENT")

    lines.append("END:VCALENDAR")

    ics_content = "\r\n".join(lines) + "\r\n"

    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": 'attachment; filename="mesai-timetable.ics"'},
    )
