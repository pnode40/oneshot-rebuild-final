DO $$ BEGIN
    CREATE TYPE "public"."athlete_role" AS ENUM('high_school', 'transfer_portal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."position_enum" AS ENUM('QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS', 'ATH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."user_role" AS ENUM('athlete', 'recruiter', 'admin', 'parent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"custom_url_slug" varchar(100),
	"slug" varchar(255) NOT NULL,
	"high_school_name" varchar(256),
	"graduation_year" integer,
	"gpa" numeric(3, 2),
	"position_primary" "position_enum" NOT NULL,
	"position_secondary" "position_enum",
	"jersey_number" integer,
	"athlete_role" "athlete_role" DEFAULT 'high_school' NOT NULL,
	"height_in_inches" integer,
	"weight_lbs" integer,
	"profile_photo_url" text,
	"transcript_pdf_url" text,
	"highlight_video_url_primary" text,
	"ncaa_id" varchar(50),
	"years_of_eligibility" integer,
	"transfer_portal_entry_date" timestamp,
	"is_height_visible" boolean DEFAULT true NOT NULL,
	"is_weight_visible" boolean DEFAULT true NOT NULL,
	"is_gpa_visible" boolean DEFAULT true NOT NULL,
	"is_transcript_visible" boolean DEFAULT true NOT NULL,
	"is_ncaa_info_visible" boolean DEFAULT true NOT NULL,
	CONSTRAINT "profiles_custom_url_slug_unique" UNIQUE("custom_url_slug"),
	CONSTRAINT "profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
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
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_custom_url_slug_idx" ON "profiles" USING btree ("custom_url_slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_slug_idx" ON "profiles" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");