# Trajectory Plan Generator & UI Restructure

## Goal Description
1. Fix the dummy string plan generation by removing the static failover and relying on the AI to generate a detailed, comprehensive step-by-step plan.
2. Refactor the trajectory detail UI so that clicking "Build Plan" does not instantly build a plan statically, but rather opens the Jarvis Assistant Drawer sidebar and populates the chat with a prompt, kicking off an interactive dialog between the user and Jarvis to understand the goal deeply before generating a node-based workflow or plan.

## User Review Required
> [!IMPORTANT]
> The backend relies on an active LLM connection. If Ollama (mistral:latest) is not running locally, the AI requests will continue to fail. You need to ensure Ollama is running or provide a valid API key (e.g., OpenAI or Anthropic) in the `.env` file to see the real AI plan generator in action.

## Proposed Changes

### Frontend Changes

#### [MODIFY] [PlanView.tsx](file:///Users/cgupta/Documents/Jarvis/frontend/components/plan/PlanView.tsx)
- Add a "Build Plan with Jarvis" button in the empty state instead of the passive message.
- Expose a callback to open the Jarvis Sidebar.

#### [MODIFY] [JarvisSidebar.tsx](file:///Users/cgupta/Documents/Jarvis/frontend/components/layout/JarvisSidebar.tsx)
- Expose global state or an event listener so that other components can trigger the sidebar to open programmatically and inject a starting message.

#### [MODIFY] [page.tsx](file:///Users/cgupta/Documents/Jarvis/frontend/app/trajectory/%5Bid%5D/page.tsx)
- Instead of hitting the backend `/plans/refactor` endpoint immediately on "Build Plan", the action will now open the Jarvis drawer with an initial prompt like "Help me build a plan for my goal: X".
- Remove the static "Build Plan" button from the main panel, relying on the Jarvis AI conversation to drive the plan building.

### Backend Changes

#### [MODIFY] [plan_service.py](file:///Users/cgupta/Documents/Jarvis/backend/app/services/plan_service.py)
- Modify the fallback logic `generate_dynamic_steps` so that if an AI provider fails, it returns a clear error message in the plan step indicating that the AI provider failed (rather than silent dummy strings).
- Enhance the `system_prompt` for `generate_plan` to instruct the AI to build a comprehensive, well-researched plan.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
- Navigate to a Trajectory page.
- Enter a goal and click "Build Plan with Jarvis".
- Verify that the Jarvis sidebar opens, taking the context of the goal and starting a conversation.
- Provide a valid API key in `.env` and verify that a real, structured JSON plan is generated and displayed.
