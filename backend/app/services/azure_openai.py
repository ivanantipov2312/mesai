"""
Azure OpenAI client wrapper.
Uses the openai SDK pointed at the Azure endpoint.
"""
from openai import OpenAI
from app.config import settings

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            base_url=f"{settings.AZURE_OPENAI_ENDPOINT}openai/deployments/{settings.AZURE_OPENAI_DEPLOYMENT}",
            default_query={"api-version": settings.AZURE_OPENAI_API_VERSION},
            default_headers={"api-key": settings.AZURE_OPENAI_API_KEY},
        )
    return _client


SYSTEM_PROMPT = """You are MESA.I, an AI academic and career advisor for TalTech students.
You have the student's profile, current courses, skills, and career goals.
Give concise, actionable advice. Be encouraging but honest.
Respond in the language the student writes to you in."""


def chat_completion(messages: list, max_tokens: int = 400) -> str:
    client = get_client()
    resp = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=messages,
        max_completion_tokens=max_tokens,
        temperature=0.7,
    )
    return resp.choices[0].message.content.strip()


def build_student_context(user, enrolled_courses, skill_levels, top_careers) -> str:
    """Builds a compact context string to inject into the system prompt."""
    courses_str = ", ".join(f"{c.code} {c.name}" for c in enrolled_courses) or "none"
    skills_str = ", ".join(
        f"{v['name']} (lvl {v['level']})" for v in skill_levels.values()
    ) or "none yet"
    careers_str = ", ".join(
        f"{m['career'].title} {m['pct']}%" for m in top_careers
    ) or "unknown"

    return (
        f"Student: {user.name} | Program: {user.program} | Semester: {user.semester}\n"
        f"Career goals: {', '.join(user.career_interests or ['not set'])}\n"
        f"Enrolled courses: {courses_str}\n"
        f"Current skills: {skills_str}\n"
        f"Top career matches: {careers_str}"
    )
