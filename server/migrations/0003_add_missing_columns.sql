-- Add missing slug column to profiles table
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "slug" varchar(255) NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_slug_idx" ON "profiles" ("slug");

-- Add other potentially missing columns based on schema
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "custom_url_slug" varchar(100) NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "high_school_name" varchar(256) NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "graduation_year" integer NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "gpa" decimal(3,2) NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "position_primary" varchar(10) NOT NULL DEFAULT 'QB';
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "position_secondary" varchar(10) NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "jersey_number" integer NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "athlete_role" varchar(20) NOT NULL DEFAULT 'high_school';
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "height_in_inches" integer NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "weight_lbs" integer NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "profile_photo_url" text NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "transcript_pdf_url" text NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "highlight_video_url_primary" text NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "ncaa_id" varchar(50) NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "years_of_eligibility" integer NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "transfer_portal_entry_date" timestamp NULL;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "is_height_visible" boolean NOT NULL DEFAULT true;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "is_weight_visible" boolean NOT NULL DEFAULT true;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "is_gpa_visible" boolean NOT NULL DEFAULT true;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "is_transcript_visible" boolean NOT NULL DEFAULT true;
ALTER TABLE IF EXISTS "profiles" ADD COLUMN IF NOT EXISTS "is_ncaa_info_visible" boolean NOT NULL DEFAULT true; 