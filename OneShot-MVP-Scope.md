📌 CONTEXT: OneShot MVP Feature Scope

You are building a mobile-first, athlete-driven recruiting platform. This document defines the full set of MVP features required for the public profile, internal editing, and system infrastructure. Use this scope to align all task planning, component structure, and data models.

---

✅ REQUIRED MVP FEATURES

🔝 Public Profile (Above-the-Fold)
- Must be visible without scrolling on mobile
- Fields:
  - Profile photo (banner-style)
  - First name + Last name + Jersey Number
  - High school + Grad year
  - Position(s)
  - Height, Weight, GPA (if visible)
  - Transcript button (if public)
  - NCAA ID + Eligibility (if Transfer Portal selected + public)
  - Highlight video (YouTube embed or Hudl redirect)
  - Slug-based URL (e.g., oneshot.xyz/u/test-alpha)

🧱 Internal Athlete Profile (Editable)
- Athlete Role: High School (default), Transfer Portal (optional)
- Fields:
  - First/Last Name, Jersey Number, Grad Year, High School
  - Position(s), Height, Weight, GPA
  - Transcript Upload (PDF)
  - Profile Photo Upload (1 required, max 3)
  - Highlight Video Link (YouTube or Hudl)
  - NCAA ID + Eligibility (Transfer role only)
  - Email/Phone (private only)
  - Action Image Uploads (up to 7, for OG image generation only)
- Features:
  - Visibility toggles on each field
  - Slug selector with real-time availability check
  - Real-time internal preview of external profile
  - Media compression + OG image min size (1200x630)

🌐 Public Profile (Recruiter View)
- Layout: Mobile-first, recruiter-scannable
- Shows:
  - First Name + Last Initial
  - Grad Year, High School, Position(s)
  - Public stats: Height, Weight, GPA
  - Highlight Video: YouTube embed or Hudl thumbnail redirect
  - Header photo
- OG image generated from action photos
- QR version includes vCard (with email/phone)
- Public profile is shareable via slug URL

🎥 Highlight Video Flow
- One required
- Athlete can link both Hudl and YouTube
- Can choose which is featured
- Helper modal explains playback behavior (YouTube plays inline, Hudl = redirect)

---

❌ DEFERRED FEATURES (NOT part of MVP)
- Contact buttons / DMs
- Internal messaging
- Recruiter analytics
- 10-second shorts
- Multi-user roles (coach/parent)
- GPA parsing
- Timeline engine
- Profile completeness badge

---

⚙️ LOGIC & INFRASTRUCTURE REQUIREMENTS
- Dual-mode rendering: Social share vs QR view
- QR adds vCard download
- OG image generation must support high-res action photos
- Real-time slug availability endpoint
- Visibility logic enforced server- and client-side
- Internal vs external views = structurally decoupled, same data

---

## 📊 PROGRESS TRACKING

**For current implementation status and progress tracking, see:**
- `OneShot-MVP-Progress.md` - **Single source of truth** for all development progress
- **Status**: 🚀 **MVP COMPLETE & PRODUCTION LIVE** (95% complete)
- **Live URL**: https://oneshotrecruits.com

---

This is your execution source of truth for all frontend/backend planning inside Cursor. Treat this as a foundational doc (equivalent to a `.cursor/doc`) and refer to it in all relevant tasks. 