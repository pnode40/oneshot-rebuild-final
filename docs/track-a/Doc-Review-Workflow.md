# 📝 OneShot Documentation Review Workflow

Version: A-2025-05-27-001

## 🎯 Objective
Ensure every documentation update is reviewed by both AI and a human verifier before merging. This prevents regressions, omissions, and misalignments between code and docs.

---

## 🧭 Workflow Overview

### 🔁 Trigger Conditions
- Pull Request includes any `.md` file changes
- A `docs/` file is updated, added, or removed

### 📋 Review Process
1. **Claude 4 Review Summary**
   - Auto-generated based on diff
   - Highlights what changed, what's missing, and potential issues
   - Attached as comment to PR (future automation)

2. **Manual Verification by Eric or Reviewer**
   - Confirms completeness and accuracy
   - Uses checklist at bottom of each `.md`
   - Comments any required changes

3. **AI-Human Merge Sign-Off**
   - Claude confirms checklist passed
   - Eric (or assigned human) approves final merge

---

## ✅ Required Claude Review Template
```
## 🧠 AI Review Summary (Claude 4)
- Files changed: [...]
- Version updated? Yes/No
- Checklist present and filled? Yes/No
- Detected issues: [...]
- Suggested improvements: [...]
```

---

## 💡 Future Enhancements
- Claude adds inline suggestions to diff view
- Slack/Notion notification on failed checklist
- Auto-block merge until sign-off complete

---

## 📁 Save Location
Save this file to:
```
docs/track-a/Doc-Review-Workflow.md
```
