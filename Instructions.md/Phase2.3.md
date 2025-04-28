# Instructions.md

## 🏗️ Feature to Implement
Rebuild the Internal Profile system for athletes inside the OneShot backend.

---

## 🎯 What to Build

- Create an in-memory `mockDbProfiles` object (just like we did for Timeline)
- Secure API endpoints using `requireAuth` middleware
- Allow users to:
  - Fetch their own profile (`GET /api/profile/me`)
  - Create or update their profile (`POST /api/profile/update`)
- Profile linked to their `userId` from JWT
- Profile fields:
  - `fullName: string`
  - `phoneNumber: string`
  - `highSchool: string`
  - `gradYear: number`
  - `position: string`
  - `gpa: number`
  - `ncaaId: string`
  - `twitterHandle: string`
  - `coachName: string`
  - `coachPhone: string`
  - `coachEmail: string`
  - `highlightVideos: { title: string; url: string; visible: boolean }[]`

---

## 🛠️ Files to Edit or Create

- `/src/shared/types/profileTypes.ts` — Define AthleteProfile and HighlightVideo types
- `/src/backend/routes/profile.ts` — Create profileRouter
- `/src/backend/index.ts` — Mount profileRouter at `/api/profile`

---

## 📋 API Endpoints

| Method | URL | Protected? | Purpose |
|:--|:--|:--|:--|
| GET | `/api/profile/me` | ✅ | Fetch the current user's profile |
| POST | `/api/profile/update` | ✅ | Create or update the user's profile |

---

## 🧪 Testing & Validation Steps (ThunderClient)

✅ 1. Send `GET /api/profile/me` with a valid Bearer Token
- Should return 404 if no profile exists yet

✅ 2. Send `POST /api/profile/update`
- Provide profile JSON body
- Should create or update your athlete profile

✅ 3. Send `GET /api/profile/me` again
- Confirm profile info is saved correctly

✅ 4. Confirm authorization is required (401 error if no token)

---

## 📸 Proof of Completion (Mandatory)

✅ Screenshot of `POST /api/profile/update` success response  
✅ Screenshot of updated profile from `GET /api/profile/me`  
✅ Screenshot showing Authorization Bearer token set properly in ThunderClient

---

## 📜 Important Reminders

- No frontend changes yet — backend only
- User must be authenticated for all profile actions
- Handle missing profile cleanly with 404 error
- Use strict TypeScript typing across all files

---

# 🏁 Success Criteria for Phase 2.3
✅ Profile can be securely created and updated  
✅ Profile tied to the correct authenticated userId  
✅ Profile can be fetched dynamically  
✅ ThunderClient tests fully passing
✅ No backend crashes or silent errors
