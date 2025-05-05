# OneShot Recruiting Platform: Project Context

## Project Overview

The OneShot Recruiting Platform is a modern recruitment system built with a Node.js/TypeScript backend using PostgreSQL as the database. The platform includes user authentication (JWT), profile management, and various recruitment-specific features.

## System Architecture

### Tech Stack
- **Backend**: Node.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (v0.43.1)
- **Migration Tool**: Drizzle Kit

### Database Structure
- Multiple tables including users, profiles, and recruiting-specific entities
- Schema managed through Drizzle ORM models and migrations
- Migration tracking through the `drizzle.__drizzle_migrations` table

## Migration System Current State

### Issue Description
The project is experiencing a critical issue with its Drizzle ORM migration system. The standard Drizzle migrate function fails with a "No file migrations/undefined.sql found" error. This prevents using the standard migration workflow.

### Root Causes Identified
1. **Type Mismatch**: The `created_at` column in the migration tracking table is defined as `BIGINT` but contains string values
2. **Library Compatibility**: This mismatch appears to confuse Drizzle ORM's migrator in version 0.43.1
3. **Manual Migrations**: Initial migrations (0000_red_karma.sql, 0001_abnormal_yellowjacket.sql) were manually applied to the database

### Current Workaround
A hybrid migration script (`server/src/db/migrate.ts`) that:
1. Verifies the database state first
2. Only runs migrations if pending migrations are found
3. Bypasses the standard migrate function when needed

## Migration Files

The project contains three migration files:
- `0000_red_karma.sql` - Initial schema with users table
- `0001_abnormal_yellowjacket.sql` - Adds profiles table
- `0002_test_migration.sql` - Test migration

These are tracked in `migrations/meta/_journal.json` which must be kept in sync with the database migration tracking table.

## Project Goals

1. Fix the migration system to work with standard Drizzle ORM tools
2. Create a sustainable solution that will work with future Drizzle updates
3. Minimize technical debt and maintain a clean architecture
4. Ensure smooth developer experience for future migrations 