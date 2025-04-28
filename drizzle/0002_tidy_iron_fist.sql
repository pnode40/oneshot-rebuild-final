CREATE TABLE "metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"height_feet" integer,
	"height_inches" integer,
	"weight" integer,
	"forty_yard_dash" numeric,
	"shuttle_run" numeric,
	"vertical_jump" numeric,
	"passing_yards" integer,
	"rushing_yards" integer,
	"receiving_yards" integer,
	"tackles" integer,
	"sacks" integer
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "contact_email" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "contact_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "twitter_handle" varchar(50);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "coach_name" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "coach_email" varchar(255);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "coach_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profile_pictures" jsonb;--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;