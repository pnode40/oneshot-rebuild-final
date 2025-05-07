# Numeric Field Handling Verification Guide

This guide outlines steps to verify proper handling of numeric fields in the OneShot profile API, from request to database storage.

## Overview of the Fix

We've implemented a solution to properly handle numeric fields between:
- Client request (string formats)
- Zod validation (converts to JavaScript number types)
- Drizzle ORM (requires SQL template literals for numeric fields)
- PostgreSQL database (stores as proper numeric types)

## Key Implementation Details

```typescript
// In profile.ts - using SQL template literals for numeric fields
graduationYear: validatedData.graduationYear !== null 
  ? sql`${validatedData.graduationYear}` 
  : null,
gpa: validatedData.gpa !== null 
  ? sql`${validatedData.gpa}` 
  : null,
```

This approach bridges the type mismatch between JavaScript numbers (from Zod) and Drizzle's type expectations while ensuring database integrity.

## Verification Steps

### 1. Code Compilation Check

```bash
cd server
npx tsc --noEmit
```

**Expected outcome:** TypeScript should compile without errors related to the numeric field types in `profile.ts`. 

> Note: You may see an unrelated rootDir error about `drizzle.config.ts` which is not relevant to our fix.

### 2. Environment Setup Troubleshooting

If you encounter environment issues:

#### Port Conflict
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Resolution:**
- Kill existing Node processes: `taskkill /F /IM node.exe` (Windows)
- Or modify server port in `src/index.ts`

#### Database Connection Issues
```
Error: connect ECONNREFUSED ::1:5432
```
**Resolution:**
- Ensure PostgreSQL is running
- Check your database connection string in environment variables
- Consider creating a mock database interface for testing

### 3. Manual Server Testing

#### Prerequisites:
- Start the server: `npm run dev`
- Use the logging statements we added to observe numeric field types

#### Test creating a profile with numeric values:
- Use Postman or the `manual-test.js` script to send a POST request to `/api/profile`
- Include numeric fields as strings: `"gpa": "3.75"`, `"graduationYear": "2025"`, etc.
- Check server logs to verify:
  - After Zod validation, `typeof validatedData.gpa` should be `"number"`
  - After Zod validation, `typeof validatedData.graduationYear` should be `"number"`

### 4. Manual Database Verification

Connect to your PostgreSQL database and run:

```sql
SELECT
  id, 
  full_name,
  gpa,
  graduation_year,
  eligibility_years_remaining,
  pg_typeof(gpa) AS gpa_db_type,
  pg_typeof(graduation_year) AS grad_year_db_type,
  pg_typeof(eligibility_years_remaining) AS eligibility_db_type
FROM profiles
ORDER BY id DESC
LIMIT 5;
```

**Expected outcome:**
- `gpa_db_type` should be `numeric` (not text/varchar)
- `grad_year_db_type` should be `integer` (not text/varchar)
- `eligibility_db_type` should be `integer` (not text/varchar)
- Values should be correctly stored (not string representations)

## Why This Solution Works

1. **Zod Validation**: Correctly transforms string inputs to JavaScript numbers
2. **SQL Template Literals**: Bridges the type mismatch between JavaScript numbers and Drizzle's TypeScript expectations
3. **PostgreSQL Storage**: Maintains numeric types in the database

This solution ensures type safety throughout the entire flow without any TypeScript workarounds or compromises on data integrity. 