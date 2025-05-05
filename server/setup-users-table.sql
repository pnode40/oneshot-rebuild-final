-- Create user role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE "user_role" AS ENUM('athlete', 'recruiter', 'admin', 'parent');
    END IF;
END$$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "hashed_password" text NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "email_verification_token" text,
    "role" "user_role" DEFAULT 'athlete' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "first_name" varchar(100),
    "last_name" varchar(100),
    "profile_picture" text,
    "bio" text,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email"); 