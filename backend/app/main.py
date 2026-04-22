from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine, SessionLocal
import app.models  # noqa: F401 — registers all models before create_all
from app.routes import assignments
from app.seed import seed_database
from app.routes.auth import router as auth_router
from app.routes.courses import router as courses_router
from app.routes.skills import router as skills_router
from app.routes.career import router as career_router
from app.routes.ai import router as ai_router
from app.routes.timetable import router as timetable_router
from app.routes.calendar import router as calendar_router
from app.routes.notification_settings import router as notification_settings_router
from app.routes.programme import router as programme_router
from app.routes.feedback import router as feedback_router
from app.routes.assignments import router as assignment_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MESA.I")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(skills_router)
app.include_router(career_router)
app.include_router(ai_router)
app.include_router(timetable_router)
app.include_router(calendar_router)
app.include_router(notification_settings_router)
app.include_router(programme_router)
app.include_router(feedback_router)
app.include_router(assignment_router)


@app.get("/health")
def health():
    return {"status": "ok"}
