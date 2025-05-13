CREATE TYPE "public"."athlete_role" AS ENUM('high_school', 'transfer_portal');--> statement-breakpoint
CREATE TYPE "public"."position_enum" AS ENUM('QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS', 'ATH');--> statement-breakpoint
CREATE TYPE "public"."sport_enum" AS ENUM('football', 'basketball', 'baseball', 'soccer', 'track', 'swimming', 'volleyball', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('athlete', 'recruiter', 'admin', 'parent');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"role" "athlete_role" DEFAULT 'high_school' NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"sport" "sport_enum" DEFAULT 'football' NOT NULL,
	"position" varchar(100) NOT NULL,
	"grad_year" integer NOT NULL,
	"high_school" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"height" varchar(50) NOT NULL,
	"weight" integer NOT NULL,
	"gpa" numeric(3, 2),
	"transcript_pdf_url" text,
	"coach_name" text,
	"coach_email" text,
	"coach_phone" text,
	"profile_photo_url" text,
	"featured_video_url" text,
	"og_image_selection_url" text,
	"video_urls" text[],
	"bio" text,
	"custom_url_slug" varchar(100) NOT NULL,
	"public" boolean DEFAULT true NOT NULL,
	"show_contact_info" boolean DEFAULT true NOT NULL,
	"show_coach_info" boolean DEFAULT true NOT NULL,
	"show_transcript" boolean DEFAULT true NOT NULL,
	"completeness_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_custom_url_slug_unique" UNIQUE("custom_url_slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
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
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profiles_custom_url_slug_idx" ON "profiles" USING btree ("custom_url_slug");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");