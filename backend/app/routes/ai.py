from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.user_course import UserCourse
from app.models.skill import Skill
from app.models.ai_cache import AICache
from app.schemas.ai import ChatRequest, ChatResponse, CourseFeedbackRequest, CourseFeedbackResponse, DailyTipResponse
from app.services.azure_openai import chat_completion, build_student_context, SYSTEM_PROMPT
from app.services.skill_mapper import compute_skill_levels
from app.services.career_matcher import top_career_matches
from app.models.career_path import CareerPath
from app.dependencies import get_current_user
from app.routes.courses import my_courses

from app.agent.graph import agent_executor
from langchain_core.messages import HumanMessage, SystemMessage

router = APIRouter(prefix="/api/ai", tags=["ai"])

DAILY_TIP_TTL_HOURS = 24


def _get_student_data(user: User, db: Session):
    user_courses = db.query(UserCourse).filter(UserCourse.user_id == user.id).all()
    enrolled_courses = [uc.course for uc in user_courses]
    all_skills = db.query(Skill).all()
    all_careers = db.query(CareerPath).all()
    skill_levels = compute_skill_levels(user, enrolled_courses, all_skills)
    user_skill_ints = {k: v["level"] for k, v in skill_levels.items()}
    top_careers = top_career_matches(all_careers, user_skill_ints, top_n=3)
    return enrolled_courses, skill_levels, top_careers


def _get_cache(db: Session, user_id: int, key: str, ttl_hours: int) -> str | None:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=ttl_hours)
    entry = (
        db.query(AICache)
        .filter(AICache.user_id == user_id, AICache.cache_key == key)
        .order_by(AICache.created_at.desc())
        .first()
    )
    if entry and entry.created_at.replace(tzinfo=timezone.utc) > cutoff:
        return entry.response
    return None


def _set_cache(db: Session, user_id: int, key: str, response: str):
    db.add(AICache(user_id=user_id, cache_key=key, response=response))
    db.commit()

@router.post("/chat")
async def chat_endpoint(
    payload: dict, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    user_message = payload.get("message")
    if not user_message:
        raise HTTPException(status_code=400, detail="No message provided")

    # 1. Fetch fresh data for context (the "Memory" of the agent)
    enrolled = my_courses(current_user, db)

    # We'll use your existing context builder!
    context_str = build_student_context(
        user=current_user,
        enrolled_courses=enrolled,
        skill_levels={}, # Add if you have them
        top_careers=[]   # Add if you have them
    )

    current_date_str = datetime.now().strftime("%A, %B %d, %Y")
    full_instructions = f"{SYSTEM_PROMPT}\n\nTODAY'S DATE: {current_date_str}\n\nCURRENT STUDENT DATA:\n{context_str}"

    # 2. Prepare the Initial State
    # We combine the SYSTEM_PROMPT with the real-time DB context
    inputs = {
        "messages": [
            SystemMessage(content=full_instructions),
            HumanMessage(content=user_message)
        ]
    }

    config = {"configurable": {"user_id": current_user.id}}
    current_date_str = datetime.now().strftime("%A, %B %d, %Y")

    # 3. Invoke the LangGraph Agent
    # This will loop: Agent -> Tool -> Agent -> Final Answer
    try:
        result = agent_executor.invoke(inputs, config=config)
        
        # The last message in the state is the AI's final response
        final_answer = result["messages"][-1].content
        
        return {"response": final_answer}
    except Exception as e:
        print(f"Agent Error: {e}")
        raise HTTPException(status_code=500, detail="Agent failed to process request")


@router.post("/course-feedback", response_model=CourseFeedbackResponse)
def course_feedback(
    body: CourseFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == body.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrolled_courses, skill_levels, top_careers = _get_student_data(current_user, db)
    context = build_student_context(current_user, enrolled_courses, skill_levels, top_careers)

    action_verb = "adding" if body.action == "add" else "dropping"
    prompt = (
        f"The student is considering {action_verb} the course '{course.name}' ({course.code}, {course.ects} ECTS). "
        f"It teaches: {', '.join(course.skills_taught or [])}. "
        f"In 2-3 sentences, tell them how this affects their career trajectory. Be specific."
    )

    messages = [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{context}"},
        {"role": "user", "content": prompt},
    ]
    feedback = chat_completion(messages, max_tokens=800)
    return CourseFeedbackResponse(feedback=feedback, course_name=course.name)


@router.get("/daily-tip", response_model=DailyTipResponse)
def daily_tip(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cache_key = "daily_tip"
    cached = _get_cache(db, current_user.id, cache_key, DAILY_TIP_TTL_HOURS)
    if cached:
        return DailyTipResponse(tip=cached, cached=True)

    enrolled_courses, skill_levels, top_careers = _get_student_data(current_user, db)
    context = build_student_context(current_user, enrolled_courses, skill_levels, top_careers)

    messages = [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{context}"},
        {"role": "user", "content": (
            "Give me one short, specific, actionable tip for today based on my academic situation. "
            "Max 2 sentences."
        )},
    ]
    tip = chat_completion(messages, max_tokens=800)
    _set_cache(db, current_user.id, cache_key, tip)
    return DailyTipResponse(tip=tip, cached=False)
