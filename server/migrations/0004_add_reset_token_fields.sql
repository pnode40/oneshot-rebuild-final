-- Add reset_token and reset_token_expiry columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token_expiry" timestamp with time zone;
 
-- Add index on reset_token for faster lookups
CREATE INDEX IF NOT EXISTS "users_reset_token_idx" ON "users" ("reset_token"); 