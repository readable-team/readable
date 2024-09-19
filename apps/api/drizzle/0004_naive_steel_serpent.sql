DO $$ BEGIN
 CREATE TYPE "public"."_team_restriction_type" AS ENUM('DASHBOARD_WRITE', 'USERSITE_READ');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_restrictions" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"type" "_team_restriction_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_restrictions" ADD CONSTRAINT "team_restrictions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
