-- Add last_login_at to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp with time zone;

-- Create sports enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "sports_enum" AS ENUM ('Football');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create football_positions_enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "football_positions_enum" AS ENUM ('QB', 'WR', 'RB', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS', 'ATH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create visibility_enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "visibility_enum" AS ENUM ('public', 'private', 'recruiters_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create commitment_status_enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "commitment_status_enum" AS ENUM ('uncommitted', 'committed', 'signed', 'transfer_portal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create media_type_enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "media_type_enum" AS ENUM ('highlight_video', 'game_film', 'skills_video', 'interview', 'image', 'document', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create athlete_profiles table
CREATE TABLE IF NOT EXISTS "athlete_profiles" (
  "user_id" integer PRIMARY KEY NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "phone_number" varchar(20),
  "date_of_birth" timestamp with time zone,
  "profile_image_url" text,
  "city" varchar(100),
  "state" varchar(50),
  "high_school_name" varchar(256),
  "graduation_year" integer,
  "gpa" decimal(3,2),
  "height_inches" integer,
  "weight_lbs" integer,
  "sport" "sports_enum" NOT NULL DEFAULT 'Football',
  "positions" text[],
  "primary_position" "football_positions_enum",
  "secondary_position" "football_positions_enum",
  "forty_yard_dash" decimal(4,2),
  "bench_press_max" integer,
  "vertical_leap" decimal(4,1),
  "shuttle_run" decimal(4,2),
  "other_athletic_stats" jsonb,
  "visibility" "visibility_enum" NOT NULL DEFAULT 'public',
  "commitment_status" "commitment_status_enum" DEFAULT 'uncommitted',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for athlete_profiles
CREATE INDEX IF NOT EXISTS "athlete_name_idx" ON "athlete_profiles" ("last_name", "first_name");
CREATE INDEX IF NOT EXISTS "sport_position_idx" ON "athlete_profiles" ("sport", "primary_position");
CREATE INDEX IF NOT EXISTS "graduation_year_idx" ON "athlete_profiles" ("graduation_year");

-- Create media_items table
CREATE TABLE IF NOT EXISTS "media_items" (
  "id" serial PRIMARY KEY,
  "athlete_profile_user_id" integer NOT NULL REFERENCES "athlete_profiles" ("user_id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "media_type" "media_type_enum" NOT NULL DEFAULT 'highlight_video',
  "video_url" text,
  "thumbnail_url" text,
  "document_url" text,
  "image_url" text,
  "is_featured" boolean DEFAULT false,
  "is_public" boolean DEFAULT true,
  "upload_date" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for media_items
CREATE INDEX IF NOT EXISTS "media_athlete_profile_id_idx" ON "media_items" ("athlete_profile_user_id");
CREATE INDEX IF NOT EXISTS "media_featured_idx" ON "media_items" ("is_featured");
CREATE INDEX IF NOT EXISTS "media_type_idx" ON "media_items" ("media_type"); 