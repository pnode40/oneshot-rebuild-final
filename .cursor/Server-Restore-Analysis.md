# 🧠 Server Restore Analysis — Postmortem & System Fixes

This document summarizes the systemic causes of prior server instability and outlines the fixes that have now been implemented.

## Root Cause Summary

| Problem | Cause | Resolution |
|--------|-------|------------|
| DB connection failed with `ECONNREFUSED ::1:5432` | `.env` was misformatted and parsed incorrectly by `dotenv` | Reformatted `.env`; moved `dotenv.config()` to `index.ts` |
| Server loaded `.env` late | `dotenv.config()` was called in `db/client.ts` instead of `index.ts` | Moved dotenv logic to `index.ts` as first executable line |
| Neon schema mismatch | Missing `slug` column | Updated Drizzle schema and generated new migrations |
| Migrations system was broken | Legacy files were out-of-sync with actual DB | Deleted old migrations, regenerated from clean schema |
| Server file structure was unclear | Old, unused test/backup files cluttered the repo | Cleaned out legacy files and updated `.gitignore` |

---

## Claude Correction Protocol (✅ Success)

Claude failed in earlier attempts to:

- Place `dotenv.config()` in the correct file
- Detect malformed `.env` values
- Recognize that migrations were outdated

We've now implemented:

- `.mdc` rules enforcing `dotenv.config()` in `index.ts`
- Verified Claude loads `.cursor/Server-Restore-Checkpoint.md` + `.mdc`
- Locked in successful logic as checkpoint commit `8839c27`

---

This .md file is designed to be referenced by Claude via `.mdc` loader rules.
