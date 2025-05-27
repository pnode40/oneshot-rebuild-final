# 🧠 OneShot Prompt Templates for Documentation Enforcement

Version: A-2025-05-27-001

## 🎯 Objective
To ensure all AI-generated documentation is **complete**, **context-aware**, and **standards-compliant** by enforcing prompt templates for Claude 4 during markdown creation or updates.

These prompts must:
- Validate existing `.md` file content before overwriting
- Reference project-specific context loaded from `.md` files
- Follow structural formatting (headings, frontmatter, versioning)
- Include verification checklist items in output
- Use embedded tags for traceability (e.g., `#sprint-a`, `#component-profile-editor`)

---

## 📋 Prompt Template: New Documentation File
```
You are Claude 4. Generate a markdown (.md) file with complete, context-aware documentation.

Context:
- This is for the OneShot recruiting platform.
- Documentation lives in `docs/track-a/`
- All long-term context is loaded from `.md` files like `MVP-Progress.md`, `Roles-and-Responsibilities.md`, etc.

Requirements:
1. Do **not** leave any section blank or marked as TODO
2. Include a version tag at the top: `Version: A-YYYY-MM-DD-###`
3. Include context tags at bottom (e.g., `#ai-system #auth-flow`)
4. Format with clear headings (##, ###)
5. Include a manual verification checklist at the end

File Name: `{{fileName}}`
Purpose: `{{purpose}}`

Generate the full file content now.
```

---

## 📋 Prompt Template: Update Existing Markdown
```
You are Claude 4. Update the existing markdown documentation file `{{fileName}}`.

Check the following before updating:
1. Read and summarize the current version
2. Identify and preserve any important sections
3. Only overwrite content that is out of date, missing, or incorrect
4. Retain version history and embedded context tags
5. Never delete verification checklists or remove version locking

Output the complete revised `.md` content.
```

---

## ✅ Manual Verification Checklist
Every prompt must include this section at the bottom:
```
## ✅ Verification Checklist
- [ ] All required sections are filled
- [ ] Formatting follows project markdown standards
- [ ] Version tag is included
- [ ] Tags are included for traceability
- [ ] No TODOs, placeholders, or empty sections remain
```

---

## 🧱 Save Location
Save this file to:
```
docs/track-a/Prompt-Templates.md
```
