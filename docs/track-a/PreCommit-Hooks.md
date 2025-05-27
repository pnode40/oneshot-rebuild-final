# 🔒 OneShot Pre-Commit Hook Configuration

Version: A-2025-05-27-001

## 🎯 Objective
Prevent empty, shallow, or invalid markdown (`.md`) documentation from being committed to the codebase.

These Git hooks act as a **first line of defense** to enforce doc quality **before** any commit reaches the repository.

---

## 🛠️ Hook Configuration Overview
### 📄 File: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint:docs && npm run check:md-safety
```

---

## ✅ Hook Command Definitions

### 🔍 `lint:docs`
Checks formatting and structure of markdown files using tools like `markdownlint-cli`:
```json
"scripts": {
  "lint:docs": "markdownlint docs/**/*.md"
}
```

### 🧪 `check:md-safety`
Runs a custom Node/TypeScript script that:
- Rejects commits with `.md` files < 300 characters
- Flags files containing:
  - TODO / FIXME / Placeholder
  - Missing version tag (`Version:`)
  - Missing required sections (e.g., checklist, tags)
- Optionally invokes Claude API to validate semantics (future phase)

---

## 💥 Failure Behavior
If any check fails:
- The commit is aborted
- A clear error message is printed explaining what needs to be fixed

---

## 📁 Save Location
Save this file to:
```
docs/track-a/PreCommit-Hooks.md
```
