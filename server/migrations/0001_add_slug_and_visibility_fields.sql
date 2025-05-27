-- Create new enums
CREATE TYPE "athlete_role_enum" AS ENUM ('high_school', 'transfer_portal');

-- Add new fields to athlete_profiles table
ALTER TABLE "athlete_profiles" 
  -- URL Slug
  ADD COLUMN "slug" varchar(100) NOT NULL,
  
  -- Athlete Role
  ADD COLUMN "athlete_role" "athlete_role_enum" NOT NULL DEFAULT 'high_school',
  
  -- Personal Information
  ADD COLUMN "jersey_number" varchar(10),
  
  -- Academic Information
  ADD COLUMN "transcript_url" text,
  
  -- NCAA Information
  ADD COLUMN "ncaa_id" varchar(50),
  ADD COLUMN "eligibility_status" varchar(100),
  
  -- Performance Metrics
  ADD COLUMN "broad_jump" decimal(4, 1),
  ADD COLUMN "pro_agility" decimal(4, 2),
  ADD COLUMN "squat" integer,
  ADD COLUMN "deadlift" integer,
  
  -- Coach Information
  ADD COLUMN "coach_first_name" varchar(100),
  ADD COLUMN "coach_last_name" varchar(100),
  ADD COLUMN "coach_email" varchar(255),
  ADD COLUMN "coach_phone" varchar(20),
  ADD COLUMN "is_coach_verified" boolean NOT NULL DEFAULT false,
  
  -- Featured Video
  ADD COLUMN "featured_video_url" text,
  ADD COLUMN "featured_video_type" varchar(20),
  ADD COLUMN "featured_video_thumbnail" text,
  
  -- Visibility Controls
  ADD COLUMN "show_height" boolean NOT NULL DEFAULT true,
  ADD COLUMN "show_weight" boolean NOT NULL DEFAULT true,
  ADD COLUMN "show_gpa" boolean NOT NULL DEFAULT true,
  ADD COLUMN "show_transcript" boolean NOT NULL DEFAULT false,
  ADD COLUMN "show_ncaa_info" boolean NOT NULL DEFAULT true,
  ADD COLUMN "show_performance_metrics" boolean NOT NULL DEFAULT true,
  ADD COLUMN "show_coach_info" boolean NOT NULL DEFAULT true,
  
  -- Overall Profile Status
  ADD COLUMN "is_public" boolean NOT NULL DEFAULT false;

-- Create slug index
CREATE UNIQUE INDEX "athlete_slug_idx" ON "athlete_profiles"("slug");

-- Create temporary function to generate slugs for existing records
CREATE OR REPLACE FUNCTION generate_unique_slug() RETURNS void AS $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER;
BEGIN
  FOR rec IN SELECT * FROM athlete_profiles LOOP
    -- Generate base slug from first and last name
    base_slug := LOWER(REGEXP_REPLACE(CONCAT(rec.first_name, '-', rec.last_name), '[^a-zA-Z0-9]', '-', 'g'));
    
    -- Remove consecutive hyphens
    base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
    
    -- Trim hyphens from start and end
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    -- Initialize variables
    final_slug := base_slug;
    counter := 1;
    
    -- Check for uniqueness
    WHILE EXISTS (SELECT 1 FROM athlete_profiles WHERE slug = final_slug AND user_id != rec.user_id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Update the record
    UPDATE athlete_profiles
    SET slug = final_slug
    WHERE user_id = rec.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing records
SELECT generate_unique_slug();

-- Drop the temporary function
DROP FUNCTION generate_unique_slug();

-- Add NOT NULL constraint to slug now that all rows have values
ALTER TABLE "athlete_profiles" ALTER COLUMN "slug" SET NOT NULL; 