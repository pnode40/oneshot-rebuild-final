# META-Index.md

This index lists all project-wide Cursor Docs used for long-term memory and AI collaboration on the OneShot platform.

---

## 🔧 Architecture & Infrastructure
- `@ARCH-Overview` – System architecture and component boundaries
- `@STYLE-Backend` – File structure, API modularity, auth layers
- `@STYLE-Frontend` – Component hierarchy, styling conventions, hooks

## 🧠 Core Principles & Patterns
- `@LOGIC-Core` – Global business rules (e.g., slugs, visibility flags)
- `@LOGIC-Workflows` – Common user flows (registration, onboarding, etc.)
- `@PATTERN-API` – REST conventions, auth handling, error formats
- `@PATTERN-Database` – Drizzle patterns, FK handling, enums, numeric types
- `@PATTERN-Components` – Reusable UI patterns: cards, buttons, layouts
- `@PATTERN-JWTAuthentication` – JWT token generation, validation, and usage patterns
- `@PATTERN-SecurePasswordManagement` – Secure password hashing and verification
- `@PATTERN-ReactAuthContext` – Authentication state management in React
- `@PATTERN-ZodRequestValidation` – Request validation using Zod schemas

## 🔤 Language & Vocabulary
- `@TERM-Glossary` – Definitions of domain-specific terms

## 📦 MVP & Milestones
- `@MVP-May21` – Full MVP deliverables for May 21, 2025 milestone

## 💼 Features
- `@FEATURE-AuthFlow` – Authentication system including registration, login, and JWT handling
- `@FEATURE-ProfileFlow` – User profile creation and management

## 🚫 Meta & QA
- `@META-AntiPatterns` – Common doc problems to avoid
- `@README-for-AI` – Developer onboarding briefing for Claude
- `@CHECKLIST-Verification` – Manual verification criteria

---

**Usage Example:**  
"When generating the athlete profile API route, follow `@MVP-May21`, apply `@PATTERN-API`, and validate against `@LOGIC-Core`."

> Keep this index updated when new docs are created or existing ones versioned.
> Use this as a jumping-off point at the start of any major coding task.
