from app.models.user import User
from app.models.course import Course
from .assignment import Assignment  # Add this!
from app.models.user_course import UserCourse
from app.models.skill import Skill
from app.models.career_path import CareerPath
from app.models.ai_cache import AICache
from app.models.calendar_note import CalendarNote
from app.models.notification_settings import NotificationSettings
from app.models.feedback import CourseFeedback

__all__ = ["User", "Course", "UserCourse", "Skill", "CareerPath", "AICache", "CalendarNote", "NotificationSettings", "CourseFeedback", "Assignment"]
