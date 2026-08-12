# Jarvis Personal OS — AI-Powered Personal Operating System

> **Continuity > Daily Productivity Theater**
> Jarvis is a model-agnostic personal operating system built to solve the **continuity problem**. It ensures your interests, projects, and focus areas maintain momentum across time without corporate shame or rigid database overhead.

---

## 🌟 Key Features

- **Universal `Trajectory` Primitive**: Model any interest, career move, creative project, learning goal, or user-defined custom category dynamically.
- **User Custom Categories**: Create trajectories with built-in categories (*Interest, Career Move, Money System, Trip Plan, Personal Plan, Creative, Learning, Health*) or define custom categories (*Startup, Gaming & Esports, Philosophy, Photography*).
- **Slide-Over Jarvis AI Drawer Sidebar**: Floating `Ask Jarvis AI` trigger button pinned to the viewport bottom-right on every page (`/`, `/trajectory/[id]`, `/journal`, `/reflect`), sliding out smoothly as a 420px overlay drawer with context tracking and backdrop blur.
- **Zero-Downtime Database Resilience**: Configured for PostgreSQL 16 + pgvector, with automatic fallback to local SQLite (`sqlite+aiosqlite:///./jarvis_dev.db`) whenever Docker/PostgreSQL is offline.
- **Model-Agnostic AI Layer**: Model support for OpenAI (`gpt-4o`), Anthropic (`claude-3-5-sonnet`), Google Gemini, local open-weights via **Ollama** (`llama3.1`, `deepseek-r1`), and custom OpenAI-compatible servers (vLLM, LM Studio, Groq).
- **Dynamic Task-to-Model Routing**: Automatically routes tasks (e.g. journal analysis vs plan generation) to optimal models with instant local/fallback recovery.
- **AI Plan Generator & Refactor Engine**: Generates action steps categorized into *Lighter (1-week)*, *Balanced*, or *Intense* execution modes based on your active standing.
- **Daily Journal Pattern Analysis**: Extracts non-judgmental pattern synthesis from daily reflections and proposes lightweight refactors when momentum stalls.
- **AI Refactor Boundary Controls (`PermissionCard`)**: Queues AI-proposed plan modifications for explicit user approval before mutating your active plans.
- **Multi-Tone Dark Editorial Design System**: Multi-shade dark palette (obsidian graphite `#090a0f`, slate `#11141d`), ambient radial glow, indigo (`#818cf8`) & emerald (`#34d399`) accents, Unsplash photo cards, and 7-day horizon calendar.

---

## 🛠️ Architecture & Tech Stack

```
jarvis/
├── backend/              # FastAPI, Async SQLAlchemy 2.0, Pydantic v2, Alembic, Pytest
│   ├── app/
│   │   ├── ai/           # Provider abstraction layer & dynamic task router
│   │   ├── api/v1/       # REST API endpoints (trajectories, plans, journal, chat)
│   │   ├── core/         # Pydantic BaseSettings & configuration
│   │   ├── db/           # SQLAlchemy models & async session fallback engine
│   │   ├── schemas/      # Request/response Pydantic models
│   │   └── services/     # Business logic & AI orchestration
│   └── tests/            # Automated integration & provider test suite
├── frontend/             # Next.js 16 App Router, TypeScript, Vanilla CSS Tokens
│   ├── app/              # Page routes (Discovery, Trajectory Detail, Journal, Reflect, Onboarding)
│   ├── components/       # Trajectory cards, Plan view, Journal panel, Slide-over Jarvis drawer
│   ├── lib/              # API client wrapper & TypeScript types
│   └── styles/           # Editorial dark design system & CSS tokens
└── docker-compose.yml    # PostgreSQL 16 + pgvector container definition
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`
- **Docker** & **Docker Compose** *(optional for PostgreSQL + pgvector)*

---

### 1. Database Setup (Optional Docker Postgres)

To start PostgreSQL with the `pgvector` extension for vector search:

```bash
docker compose up -d postgres
```

*(Note: The backend automatically falls back to local SQLite database `jarvis_dev.db` if PostgreSQL is offline).*

---

### 2. Backend Setup & Startup

1. **Navigate to the backend directory and activate the virtual environment:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```bash
   cp ../.env.example ../.env
   ```

   *(Configure your API keys for OpenAI, Anthropic, Google, or local Ollama URL as desired).*

4. **Start the FastAPI Dev Server:**
   ```bash
   PYTHONPATH=. uvicorn app.main:app --reload --port 8000
   ```

   - **API Base URL**: `http://localhost:8000/api/v1`
   - **Interactive API Docs (Swagger UI)**: `http://localhost:8000/docs`

---

### 3. Frontend Setup & Startup

1. **Open a new terminal window and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Next.js Dev Server:**
   ```bash
   npm run dev
   ```

4. **Open the Application in your Browser:**
   Navigate to `http://localhost:3000`

---

## 🧪 Running Tests & Verification

### Run Backend Pytest Suite
```bash
PYTHONPATH=backend backend/venv/bin/pytest -v backend/tests
```

### Run Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

---

## 📋 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status & active model providers |
| `GET` | `/api/v1/trajectories` | List all active focus trajectories sorted by momentum |
| `POST` | `/api/v1/trajectories` | Create a new trajectory (built-in or custom category) & auto-generate initial plan |
| `GET` | `/api/v1/trajectories/{id}` | Get trajectory detail, standing overview, and active plan |
| `POST` | `/api/v1/plans/refactor` | Refactor active plan to `lighter`, `balanced`, or `intense` pace |
| `POST` | `/api/v1/plans/step/{id}/toggle` | Toggle plan step completion & automatically update momentum |
| `POST` | `/api/v1/journal` | Submit daily journal reflection for AI pattern extraction & boundary check |
| `GET` | `/api/v1/permissions` | List pending AI plan refactor proposals requiring approval |
| `POST` | `/api/v1/permissions/action` | Approve or reject an AI-proposed refactor |
| `POST` | `/api/v1/chat` | Send message to context-aware persistent Jarvis assistant |
| `POST` | `/api/v1/chat/stream` | Server-Sent Events (SSE) streaming endpoint for Jarvis chat |

---

## 📄 License
MIT License. Built with curiosity for personal continuity.
