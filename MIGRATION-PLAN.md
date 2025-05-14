# Migration Plan: Consolidating Root-level `src` Directory

## Overview

This document outlines the plan for consolidating the redundant root-level `src` directory into the primary `server/src` directory to simplify the codebase structure and reduce maintenance overhead.

## Current State

The project currently has two `src` directories:

1. **Root-level `src/`**: Contains minimal structure with only:
   - `db/`: Simple migration script
   - `types/`: Limited type definitions
   - `utils/`: Some utility functions

2. **Server `server/src/`**: Contains the complete backend implementation with:
   - Full Express.js server
   - Complete database layer with migration utilities
   - API routes, middlewares, validators, services

The root-level `src/` appears to be legacy/transitional code that should be consolidated into `server/src/`.

## Migration Steps

### 1. Update Package Scripts (✅ Completed)

- Updated `package.json` scripts to reference `server/src/db` instead of `src/db`
- Added missing scripts for custom migration commands

### 2. Verify Functionality

- Ensure all migration scripts work correctly after the update:
  ```
  npm run migrate
  npm run migrate:direct
  npm run migrate:validate
  ```
- Verify the application runs correctly:
  ```
  npm run dev
  ```

### 3. Check for Any Dependencies on Root-level `src`

- Search codebase for imports from root-level `src` directory
- Identify any code that depends on the root-level `src`
- Update dependencies to use `server/src` imports instead

### 4. Archive or Remove Root-level `src` Directory

Once all dependencies are verified and updated:

```bash
# Option 1: Archive the directory (recommended first step)
mkdir -p _archive
mv src _archive/src_legacy

# Option 2: Remove the directory (after confirming no dependencies)
rm -rf src
```

### 5. Update Documentation

- Update README.md to reflect the consolidated structure
- Remove any references to the root-level `src` directory

## Verification Plan

1. After archiving/removing the root-level `src`:
   - Run the server: `npm run dev`
   - Verify migrations: `npm run migrate:direct`
   - Check all API endpoints work as expected

2. If any issues occur:
   - Restore the archived directory
   - Fix the identified issues
   - Try again once resolved

## Timeline

- Step 1: Update Package Scripts - COMPLETE
- Step 2: Verify Functionality - TODAY
- Step 3: Check for Dependencies - TODAY
- Step 4: Archive/Remove Directory - After verification
- Step 5: Update Documentation - After successful migration

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Undocumented dependencies on root-level `src` | Medium | High | Archive first instead of deleting; run comprehensive tests |
| Script failures after updates | Low | Medium | Test each script individually before completing migration |
| Migration system errors | Low | High | Thoroughly test with test database before applying to production |

## Decision Record

This migration was initiated based on the architectural review which identified the redundant directory structure. The decision to consolidate was made to:

1. Simplify the codebase organization
2. Reduce maintenance overhead of duplicate directories
3. Clarify the canonical location for backend code
4. Prevent confusion for new developers joining the project 