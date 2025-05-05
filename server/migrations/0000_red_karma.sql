
-- Custom migration that skips enum creation if it already exists
DO $$
BEGIN
    -- Check if enum exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create enum if it doesn't exist
        CREATE TYPE "user_role" AS ENUM ('athlete', 'recruiter', 'admin', 'parent');
    END IF;
    
    -- Rest of the migration
    CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "first_name" VARCHAR(100) NOT NULL,
        "last_name" VARCHAR(100) NOT NULL,
        "role" user_role NOT NULL,
        "is_verified" BOOLEAN DEFAULT false NOT NULL,
        "created_at" TIMESTAMP DEFAULT now() NOT NULL
    );
END
$$;
    