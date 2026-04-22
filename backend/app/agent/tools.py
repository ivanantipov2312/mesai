import datetime
from typing import Annotated, Optional
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from langchain_core.tools.base import InjectedToolArg # If this import fails, see below
from app.database import SessionLocal
from app.services.calendar_service import create_calendar_note_db
from app.services.course_service import enroll_student_in_db

class EnrollInput(BaseModel):
    course_id: int = Field(description="The integer database ID of the course")

@tool(args_schema=EnrollInput)
def enroll_student_tool(
    course_id: int, 
    # This 'Annotated' tells LangGraph: "Don't ask the LLM for this, inject it from the system."
    config: Annotated[RunnableConfig, InjectedToolArg]
):
    """
    Enrolls the current student in a course using its database ID.
    """
    user_id = config.get("configurable", {}).get("user_id")
    
    if not user_id:
        return "Error: User context is missing. Are you logged in?"

    db = SessionLocal()
    try:
        result = enroll_student_in_db(db, course_id, user_id)
        if result["status"] == "success":
            return f"Successfully enrolled in {result['course_name']}! ✅"
        return f"You are already enrolled in {result['course_name']}. 📚"
    except Exception as e:
        return f"Error: {str(e)}"
    finally:
        db.close()

class UnenrollInput(BaseModel):
    course_id: int = Field(description="The integer database ID of the course to unenroll from")

@tool(args_schema=UnenrollInput)
def unenroll_student_tool(
    course_id: int, 
    config: Annotated[RunnableConfig, InjectedToolArg]
):
    """
    Removes the student from a course using its database ID.
    """
    user_id = config.get("configurable", {}).get("user_id")
    
    if not user_id:
        return "Error: User session not found."

    db = SessionLocal()
    try:
        from app.services.course_service import unenroll_student_from_db
        result = unenroll_student_from_db(db, course_id, user_id)
        
        if result["status"] == "success":
            return f"Done! You have been unenrolled from {result['course_name']} ({result['course_code']}). 🗑️"
        return result["message"]
    except Exception as e:
        return f"Error during unenrollment: {str(e)}"
    finally:
        db.close()

class CalendarInput(BaseModel):
    title: str = Field(description="Brief title of the event or note")
    start_time: str = Field(description="ISO format string for start time (e.g. '2026-04-22T10:00:00')")
    end_time: str = Field(description="ISO format string for end time")
    description: Optional[str] = Field(None, description="Optional extra details about the note")

@tool(args_schema=CalendarInput)
def create_calendar_note_tool(
    title: str,
    start_time: str,
    end_time: str,
    config: Annotated[RunnableConfig, InjectedToolArg],
    description: Optional[str] = None,
):
    """
    Creates a new note or event in the student's calendar. 
    Use this when the student wants to schedule a study session, exam, or reminder.
    """
    user_id = config.get("configurable", {}).get("user_id")
    db = SessionLocal()
    try:
        # Parse the strings sent by the LLM into datetime objects
        start_dt = datetime.datetime.fromisoformat(start_time)
        end_dt = datetime.datetime.fromisoformat(end_time)
        
        note = create_calendar_note_db(db, user_id, title, start_dt, end_dt, description)
        return f"Done! I've added '{note.title}' to your calendar for {note.start_time.strftime('%Y-%m-%d %H:%M')}. 📅"
    except Exception as e:
        return f"Error creating calendar note: {str(e)}"
    finally:
        db.close()
