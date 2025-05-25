# 🧠 ClaudePrompt – Sprint-B-004: Edit & Delete Media Items

You are Claude 3.7 Sonnet running in Cursor MAX mode. You are responsible for implementing the feature defined in `TaskPlan.md` according to the Track B protocol.

---

## 📦 Task

Implement two endpoints:

### PATCH `/api/media/:mediaItemId`
- Accepts: `{ title?: string, url?: string }`
- Edits `media_items` entry based on type:
  - `VIDEO_LINK`: title, url
  - `PDF`: title only
  - `IMAGE`: title only

### DELETE `/api/media/:mediaItemId`
- Removes media record from `media_items`
- If media is an image, delete file from `/uploads/profile-photos/`

---

## ✅ Requirements

- Validate mediaItemId as number (Zod)
- Authenticate with `requireProfileOwnerOrAdmin`
- Handle file deletion gracefully (if applicable)
- Return clear success/failure messages

---

## 🧪 Jest Tests

Write a test suite for both endpoints:
- ✅ Successful update
- ✅ Successful delete
- ❌ Invalid update payload
- ❌ Unauthorized access
- 🧨 File deletion failure (for `IMAGE`)

---

## 📂 Reference Context

- Use `TaskPlan.md`
- Follow Track B middleware, validation, and response format standards
- Obey all `.mdc` rules
- Use consistent file structure as transcript/video/photo routes

---

## 🗂️ Output Rules

- Output one complete file per response
- Include all necessary imports
- Wait for manual verification before continuing
