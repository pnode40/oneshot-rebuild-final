# OneShot-MVP-ExecutionPlan.md

This document defines the full OneShot MVP engineering execution plan, broken into seven structured phases. Each phase includes key deliverables, technical details, and expected Claude involvement via prompt generation or .mdc rules.

---

## ✅ Phase 1: Database Schema & Core Profile Backend

**Goal:** Establish complete data foundation.

- Expand DB schema (Drizzle) with all fields including vCardEmail, vCardPhone, coach info, media references, visibility flags.
- Generate & apply all migrations.
- Update core profile APIs (POST/PUT) to handle new fields.
- Update public API to filter by visibility and expose vCard-relevant data.

---

## ✅ Phase 2: Internal Profile Editing UI (Forms & Logic)

**Goal:** Enable athlete profile data input.

- Add inputs for all fields + visibility toggles.
- Slug input UI + conditional NCAA field logic.
- Preview button links to public profile.

---

## ✅ Phase 3: Public Profile Display

**Goal:** Display public-facing data at /u/:slug.

- Fetch public profile by slug.
- Respect visibility flags.
- Render mobile-first layout: above/below fold.

---

## ✅ Phase 4: Core Media Handling

**Goal:** Enable uploading/displaying essential media.

- Backend: API for profile photo upload.
- Frontend: Upload UI + YouTube/Hudl input + featured logic.
- Display media on profile.

---

## ✅ Phase 5: QR Code / vCard Logic

**Goal:** Enable sharing and QR-based contact exchange.

- Add `?source=qr` logic.
- Conditionally render vCard button.
- Generate vCard from profile fields (athlete + coach).
- QR generator in profile editor.
- Real-time slug validation + preview component.

---

## ✅ Phase 6: Advanced Media & OG Image

**Goal:** Handle action images, transcript upload, OG image generation.

- Upload UI for transcript + action images.
- Server-side compression + OG image generation.
- Public profile: OG metadata + transcript link (if public).

---

## ✅ Phase 7: Final UI/UX & Testing

**Goal:** Apply brand system, finalize UX.

- Implement color/font system.
- Final mobile polish.
- End-to-end verification (manual + automated).

---
