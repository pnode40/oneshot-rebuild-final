-- Migration: Add test column to test_migration_system table
-- Created at: 2025-05-05T14:39:46.818Z

-- Add a new column to the test_migration_system table
ALTER TABLE test_migration_system
ADD COLUMN test_column TEXT;
