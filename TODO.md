# Jarvis — Implementation Progress Tracker

> **Instructions for any agent**: Update this file as you work. Mark items `[x]` when complete, `[/]` when in progress. Add sub-items as you discover them. Never delete completed items — they serve as a record.

## Current Status
- **Phase**: Phase 1 & Phase 2 Complete (Foundation, AI Abstraction, Database Resilience & Advanced Slide-Over UI Workflows)
- **Last updated**: 2026-08-11T21:05:00+05:30
- **Last agent**: Antigravity (Google DeepMind)

---

## Phase 1: Foundation (Weeks 1–2)

### Backend Setup
- `[x]` Initialize FastAPI project with Poetry in `backend/`
- `[x]` Configure `pyproject.toml` with all dependencies (FastAPI, Asyncpg, SQLAlchemy, Alembic, Pydantic, httpx, uvicorn)
- `[x]` Set up async SQLAlchemy engine & session factory with PostgreSQL and automatic SQLite fallback (`sqlite+aiosqlite:///./jarvis_dev.db`)
- `[x]` Create `docker-compose.yml` for Postgres + pgvector
- `[x]` Set up Alembic for DB migrations
- `[x]` Create all SQLAlchemy models (see `IMPLEMENTATION_PLAN.md` § Data Model)
  - `[x]` User model (`users`)
  - `[x]` Trajectory model (`trajectories`)
  - `[x]` Plan model (`plans`)
  - `[x]` PlanStep model (`plan_steps`)
  - `[x]` JournalEntry model (`journal_entries`)
  - `[x]` JourneyEvent model (`journey_events`)
  - `[x]` Resource model (`resources`)
  - `[x]` Reflection model (`reflections`)
  - `[x]` AIPermissionLog model (`ai_permission_logs`)
- `[x]` Create Pydantic v2 schemas for request/response validation
- `[x]` Run initial migration (`alembic upgrade head`) and verify schema

### AI Abstraction Layer (Proprietary + Open Weights)
- `[x]` Create `BaseLLMProvider` interface (`backend/app/ai/providers/base.py`)
- `[x]` Implement `OpenAIProvider` (`gpt-4o`, `gpt-4o-mini`, `o3-mini`)
- `[x]` Implement `AnthropicProvider` (`claude-3-5-sonnet`, `claude-3-opus`)
- `[x]` Implement `GoogleProvider` (`gemini-1.5-pro`, `gemini-2.0-flash`)
- `[x]` Implement `OllamaProvider` (local open-weights: `llama3.1`, `mistral`, `deepseek-r1`)
- `[x]` Implement `GenericOpenAIProvider` (vLLM, LM Studio, LiteLLM proxy, Groq, Together)
- `[x]` Create `BaseEmbeddingProvider` interface
- `[x]` Implement `OpenAIEmbeddingProvider` (`text-embedding-3-small`)
- `[x]` Implement `LocalEmbeddingProvider` (`sentence-transformers` / Ollama `nomic-embed-text`)
- `[x]` Create `ModelRegistry` & dynamic Task-to-Model router based on `.env` config
- `[x]` Add integration tests for all LLM & embedding providers with mock/live fallbacks

### Backend API Routes
- `[x]` Trajectory CRUD endpoints (`/api/v1/trajectories`) with custom category support
- `[x]` Journal entry endpoints (`/api/v1/journal`)
- `[x]` Plan endpoints: generate (`/api/v1/plans/generate`), refactor (`/api/v1/plans/refactor`), toggle step (`/api/v1/plans/step/toggle`)
- `[x]` Journey event / timeline endpoints (`/api/v1/journey`)
- `[x]` Resource endpoints (`/api/v1/resources`)
- `[x]` Chat & WebSocket streaming endpoint for Jarvis (`/ws/v1/chat`)
- `[x]` Reflection endpoints (`/api/v1/reflections`)
- `[x]` AI permission endpoints: propose, approve, reject (`/api/v1/permissions`)
- `[x]` Health check endpoint (`/health`)

### Frontend Architecture & Layout Setup
- `[x]` Initialize Next.js App Router project in `frontend/`
- `[x]` Set up TypeScript, vanilla CSS design tokens (`styles/globals.css`) matching multi-tone dark editorial aesthetic
- `[x]` Create shared TypeScript types (`lib/types.ts`) matching backend Pydantic models with custom string kind support
- `[x]` Create API client & fetch wrapper (`lib/api-client.ts`)
- `[x]` Create custom hooks (`useTrajectories`, `useJournal`, `useJarvisChat`, `usePlanRefactor`)
- `[x]` Root layout (`app/layout.tsx`) with full-width container & persistent slide-over `JarvisSidebar` drawer
- `[x]` Header component (`components/layout/Header.tsx`)

### Frontend UI Components
- `[x]` **Trajectory Components**:
  - `[x]` `TrajectoryCard.tsx` (grayscale image backdrop, gradient wash, momentum line, status tag)
  - `[x]` `AddTrajectoryCard.tsx` (centered modal dialog with interactive pill category selection + custom category creation input)
  - `[x]` `TrajectoryGrid.tsx` (responsive 3-column container)
  - `[x]` `StandingPanel.tsx` ("Where you stand today" overview)
- `[x]` **Journal Components**:
  - `[x]` `JournalPanel.tsx` (dual-pane layout for compose + AI read)
  - `[x]` `JournalCompose.tsx` (textarea with submit action)
  - `[x]` `JournalRead.tsx` (AI insight display)
  - `[x]` `PermissionCard.tsx` (active/inactive state boundary UI for approving AI proposals)
- `[x]` **Plan Components**:
  - `[x]` `PlanView.tsx` (progress bar, step list)
  - `[x]` `PlanStepItem.tsx` (completion check button, step detail)
  - `[x]` `PlanActions.tsx` ("Allow lighter refactor" / "Allow intense refactor" buttons)
- `[x]` **Timeline & Calendar**:
  - `[x]` `JourneyTimeline.tsx` (chronological event stream)
  - `[x]` `WorldCalendar.tsx` (7-day past/now/future strip)
- `[x]` **Jarvis Slide-Over Drawer**:
  - `[x]` `JarvisSidebar.tsx` (floating viewport trigger button, 420px slide-over overlay drawer, backdrop blur, context box, chat feed, query box)

### Frontend Pages & Workflows
- `[x]` Onboarding page (`app/onboarding/page.tsx`): Interactive wizard creating first trajectory from scratch (zero seed data)
- `[x]` Discovery Homepage (`app/page.tsx`): Hero, Trajectory Grid, Social Radar, Calendar, Journal Panel
- `[x]` Trajectory Detail Page (`app/trajectory/[id]/page.tsx`): Hero banner, standing panel, goal setting, interactive plan, journey timeline
- `[x]` Journal Archive Page (`app/journal/page.tsx`): Full timeline of past daily entries & AI pattern reads
- `[x]` Weekly Reflection Page (`app/reflect/page.tsx`): Synthesis view & decision cockpit (Continue/Shrink/Pause/Kill)

---

## Phase 2: Core Intelligence (Week 3)

### AI Agents & Orchestration
- `[x]` Journal analysis agent (pattern detection from text, linking trajectories)
- `[x]` Plan generation agent (lighter/balanced/intense mode step generator)
- `[x]` Jarvis chat agent (context-aware assistant)
- `[x]` Permission proposal system (queues AI plan changes until user approves)
- `[x]` Trajectory momentum calculation service (recency + activity + plan progress decay)
- `[x]` Status auto-detection service (new → active → warm → stale)

### Frontend Intelligence Integrations
- `[x]` Real-time streaming response in `JarvisSidebar` via WebSocket / SSE
- `[x]` Interactive `PermissionCard` state toggle on journal AI read
- `[x]` Dynamic plan refactoring UI with mode selector
- `[x]` Momentum-based card sorting & visual scaling on homepage

---

## Phase 3: Polish & Ship (Week 4)

- `[x]` Automated database fallback (Postgres → SQLite local dev engine)
- `[x]` Multi-tone dark editorial theme refactoring
- `[x]` Slide-over Jarvis AI drawer sidebar with persistent trigger button
- `[x]` Custom Category trajectory creation modal dialog
- `[x]` End-to-end integration test suite execution (`pytest` + `npm run build` + Playwright screenshots)

---

## Notes & Decisions Log

> Append decisions here as you make them. Format: `YYYY-MM-DD: <decision/fix description>`
> 2026-08-11: Configured master implementation plan & granular TODO breakdown with model-agnostic LLM providers (Proprietary + Open Weights) and detailed frontend component architecture.
> 2026-08-11: Implemented automatic database connection fallback in FastAPI lifespan (Postgres → SQLite `jarvis_dev.db`). Refactored frontend styling to multi-tone dark editorial system (`#090a0f` / `#11141d`), converted Jarvis AI to a slide-over drawer with floating viewport button, and added support for user-defined custom categories in trajectory creation.
