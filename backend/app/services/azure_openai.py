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
... (existing rules) ...

COURSE CATALOG (ID to Name Mapping):
When a student asks for a course, look up the ID here before calling tools:
- ID 1: Introduction to Cybersecurity (ICS0001)
- ID 2: Cryptography and Data Security (ICS0014)
- ID 3: Network Fundamentals (ICS0019)
- ID 4: Network Security (ICS0026)
- ID 5: Ethical Hacking and Penetration Testing (ICS0031)
- ID 6: Malware Analysis and Reverse Engineering (ICS0035)
- ID 7: Security Operations and Incident Response (ICS0040)
- ID 8: Web Application Security (ICS0045)
- ID 9: Cloud Security Engineering (ICS0050)
- ID 10: Digital Forensics and Investigation (ICS0055)
- ID 11: Security Auditing and Compliance (ICS0060)
- ID 12: Programming Fundamentals (ITC0001)
- ID 13: Algorithms and Data Structures (ITC0015)
- ID 14: Operating Systems (ITC0028)
- ID 15: Databases (ITC0042)
- ID 16: Software Engineering (ITC0055)
- ID 17: Machine Learning Fundamentals (ITC0068)
- ID 18: Computer Networks (ITC0075)
- ID 19: Linux System Administration (ICA0001)
- ID 20: Virtualization Technologies (ICA0015)
- ID 21: Cloud Infrastructure and DevOps (ICA0028)
- ID 22: Windows Server Administration (ICA0035)
- ID 23: IT Project Management (ICA0042)

PROCEDURE:
1. Identify the course the user wants.
2. Find the ID in the catalog above.
3. Call 'enroll_student_tool' with that INTEGER ID.
4. If the course is not in the list, tell the user you couldn't find it in the current semester's offerings.
"""


def chat_completion(messages: list, max_tokens: int = 1200, temperature: float = 1.0) -> str:
    """
    gpt-5.4-nano is a reasoning model: it burns internal reasoning tokens before
    producing output. max_completion_tokens covers reasoning + response combined,
    so the budget must be large enough for both (~600 reasoning + ~600 response).
    """
    client = get_client()
    resp = client.chat.completions.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        messages=messages,
        max_completion_tokens=max_tokens,
        temperature=temperature,
    )
    return (resp.choices[0].message.content or "").strip()


def build_student_context(user, enrolled_courses, skill_levels, top_careers) -> str:
    """Builds a compact context string to inject into the system prompt."""
    courses_str = ", ".join(f"{c.course.code} {c.course.name}" for c in enrolled_courses) or "none"
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
