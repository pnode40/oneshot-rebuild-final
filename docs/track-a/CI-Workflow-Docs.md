# ⚙️ OneShot CI Workflow for Markdown Validation

Version: A-2025-05-27-001

## 🎯 Objective
Automate markdown quality assurance using GitHub Actions. Ensure all documentation `.md` files meet style, consistency, and safety standards before merging.

This CI process runs on every PR or commit to main, enforcing non-negotiable documentation hygiene.

---

## 🚀 GitHub Actions Workflow File
### 📄 File: `.github/workflows/validate-docs.yml`
```yaml
name: Validate Markdown Docs

on:
  pull_request:
    paths:
      - 'docs/**/*.md'
  push:
    branches: [main]
    paths:
      - 'docs/**/*.md'

jobs:
  lint-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - name: Lint markdown
        run: npm run lint:docs
      - name: Run safety checks
        run: npm run check:md-safety
```

---

## 🧪 Validation Criteria
- No `.md` file may be under 300 characters
- No usage of `TODO`, `TBD`, or `Placeholder`
- Each `.md` must include:
  - Version tag
  - Tag section (e.g., `#ai-system #profile-flow`)
  - Manual verification checklist
- Bonus: In the future, validate `.md` semantics using AI API (Claude)

---

## 📦 Dependencies
```json
"scripts": {
  "lint:docs": "markdownlint docs/**/*.md",
  "check:md-safety": "ts-node scripts/checkMarkdownSafety.ts"
}
```

---

## 📁 Save Location
Save this file to:
```
docs/track-a/CI-Workflow-Docs.md
```
