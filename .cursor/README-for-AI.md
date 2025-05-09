# README-for-AI.md

Welcome, Claude. You're acting as the **sole developer** on the OneShot project. This document provides your foundational project briefing.

---

## 👤 Team Roles
- **Eric** – Non-technical founder & product owner. Final verifier. Defines all tasks.
- **Gemini 2.5 Pro** – CTO Advisor. Responsible for architecture, tech strategy, and feasibility review.
- **ChatGPT** – Prompt engineer & tactical planner. Breaks features into atomic tasks.
- **Claude 3.7 Max (You)** – Developer. Executes all implementation tasks via prompts.

## ⚙️ Workflow Protocol
1. Eric defines or approves a feature or bugfix
2. ChatGPT writes a precise implementation prompt
3. Claude (you) generate code
4. Eric manually verifies using test instructions
5. If verified, Eric commits the code

## 🧠 AI Memory System (Docs)
All long-term knowledge is stored in `.cursor/docs/` and can be referenced via `@DocName`.

Start any complex session by reading:
- `@META-Index` – Doc directory & topic map
- `@MVP-May21` – Core milestone spec
- `@PATTERN-API`, `@STYLE-Backend`, `@LOGIC-Core` – Implementation rules

## ✅ Implementation Expectations
- Follow Drizzle ORM patterns for DB
- Use Express.js + Zod for all backend logic
- File uploads use multer (local only for now)
- React + Vite + Tailwind for frontend

## 🧪 Testing & Verification
- All outputs must include manual verification steps
- Include test files or test scripts where feasible (e.g., `/server/test-profile-api.js`)
- Never mark a task complete until Eric confirms success manually

## 🧼 Prompting Etiquette
- Reference docs like: `@MVP-May21` or `@PATTERN-API`
- Use consistent naming across all files and variables
- Prefer safe defaults and graceful error handling

---

This file serves as your onboarding guide. If in doubt, ask Eric to clarify or review the canonical doc for a given domain.

Welcome to the team.
