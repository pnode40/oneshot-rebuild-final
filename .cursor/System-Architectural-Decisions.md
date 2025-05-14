# System Architectural Decisions – OneShot MVP

This document defines core architectural decisions made before Phase 1 development, as informed by Gemini (CTO Advisor) and approved by Eric.

---

## ✅ Storage and Media Handling

### 🔒 Media Storage Strategy
- ✅ Decision: Use **AWS S3** for all media storage
- Includes: profile photos, action images, transcript PDFs, OG images
- Will require:
  - S3 bucket setup (prod + dev)
  - Signed URL generation for uploads (backend)
  - Public/media URL generation
  - S3 SDK (e.g. `@aws-sdk/client-s3` or `s3rver` for dev mock)

### 🧱 MediaService Abstraction
- Upload/download logic must be encapsulated in a dedicated service layer
- Avoid direct S3 logic in Express route handlers

---

## 🖼️ OG Image Generation

### ✅ Decision: Use **Vercel serverless function**
- Route: `/api/og/generate?slug=...`
- Built as a separate function/module outside main Express API
- Uses `Sharp` or image manipulation lib
- Reads profile data and selected image from DB or S3
- Injects name, jersey, year text onto selected image

---

## 🔐 Authentication and Authorization

- JWT-based authentication required for profile editing and media upload
- Claude must protect all `PUT /api/v1/profiles` and upload endpoints with:
  - JWT auth middleware
  - userId match enforcement

---

## 🧠 Visibility Logic (Critical Cross-Phase Dependency)

- Must be defined and enforced in Phase 1 schema + backend
- Each public-facing field (height, GPA, etc.) has a corresponding `isVisible` flag
- Visibility rules apply to:
  - Public profile API (Phase 3)
  - vCard download (Phase 5)
  - Transcript button (Phase 6)
- Implement shared utility: `applyVisibilityRules(profile, viewerContext)`

---

## 📐 Modular Service Structure

Express backend must separate concerns via services:
- `ProfileService`
- `MediaService`
- `OGImageService` (Phase 6)
- `VCardService` (Phase 5)
- `VisibilityUtils`

Frontend must begin abstracting:
- Form fields
- Visibility toggles
- Media inputs (image, video)

---

## 🧾 Summary

These architectural decisions apply globally across all phases and will be referenced by:
- `.mdc` rules
- Backend route scaffolds
- Schema definitions
- Claude prompts (via ChatGPT)

They must be enforced to ensure scalability, reusability, and clarity across the OneShot MVP lifecycle.
