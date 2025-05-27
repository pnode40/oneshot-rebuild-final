# 🔐 OneShot Documentation Version Locking Strategy

Version: A-2025-05-27-001

## 🎯 Objective
Ensure every documentation file is explicitly versioned and traceable to its corresponding code release or sprint.

This strategy eliminates drift between markdown files and the state of the codebase, preserving long-term continuity.

---

## 🧷 Version Tag Format
Place at the top of every `.md` file:
```
Version: A-YYYY-MM-DD-###
```
- `A` = Track A (core branch)
- `YYYY-MM-DD` = date of last doc update
- `###` = sprint or sub-step ID, incremented per doc edit

### 🔁 Examples
- `Version: A-2025-05-27-001` → First doc written today
- `Version: A-2025-06-01-004` → Fourth update on June 1

---

## 🔗 Enforcement Rules
- No `.md` is valid without a version tag
- Version must be updated **only** when:
  - The file content is changed
  - A sprint boundary has passed
- Code commits must reference `.md` version(s) they touch in commit message or PR body

---

## 🔄 Sync Tools (Future Phase)
- Add CLI tool to validate `.md` version tags across repo
- Block merges if `.md` version does not align with updated code
- Show diff between `.md` version and last-known related code file

---

## 📁 Save Location
Save this file to:
```
docs/track-a/Version-Locking.md
```
