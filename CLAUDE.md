# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MESA.I is a student academic/career advisor app for TalTech. React frontend + FastAPI backend with Azure OpenAI integration.

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload          # dev server on :8000
pytest app/tests/                      # run all tests
pytest app/tests/test_ai.py            # run single test file
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # Vite dev server on :5173
npm run build
```

### Environment
Backend needs a `.env` in `backend/`:
```
DATABASE_URL=
SECRET_KEY=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT=
AZURE_OPENAI_API_VERSION=2025-01-01-preview
```

Frontend reads `VITE_API_URL` (defaults to `http://localhost:8000`).

## Architecture

### Backend (`backend/app/`)
- `main.py` — FastAPI app, CORS (`allow_origins=["*"]`), router registration, DB seed on startup
- `routes/` — one file per domain: `auth`, `courses`, `skills`, `career`, `ai`; all prefixed `/api/<domain>`
- `services/azure_openai.py` — synchronous OpenAI client pointed at Azure; `chat_completion()` returns `str`
- `services/` — `skill_mapper`, `career_matcher`, `conflict_engine`, `recommendation_engine`, `scoring_engine`
- `models/` — SQLAlchemy models; `app/models/__init__.py` must import all models before `Base.metadata.create_all`
- `schemas/` — Pydantic request/response schemas, one file per domain
- `dependencies.py` — `get_current_user` via `HTTPBearer` JWT; all AI/career/courses routes require this

### Auth flow
Login/register returns `{ access_token }` (JWT). Frontend stores token in `localStorage["token"]` and sends it as `Authorization: Bearer <token>`.

### AI endpoints (`/api/ai/`)
- `POST /chat` — `{ message: str }` → `{ response: str }`
- `POST /course-feedback` — `{ course_id: int, action: "add"|"remove" }` → `{ feedback: str, course_name: str }`
- `GET /daily-tip` — `{ tip: str, cached: bool }` (cached 24h per user in `ai_cache` table)

All three endpoints require a valid Bearer token. They build a rich student context (enrolled courses, skill levels, top career matches) and inject it into the OpenAI system prompt.

### Frontend (`frontend/src/`)
- `api/` — thin wrappers over axios; `axios.js` exports a pre-configured instance; token must be added manually per-call from `localStorage`
- `context/AuthContext.jsx` and `hooks/useAuth.js` — currently empty; auth state lives in `localStorage` only
- Pages use `DashboardLayout` wrapper; routing in `App.jsx`
