DO $$ BEGIN
 CREATE TYPE "public"."_site_header_link_state" AS ENUM('ACTIVE', 'DISABLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_header_links" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"state" "_site_header_link_state" DEFAULT 'ACTIVE' NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_header_links_site_id_unique" UNIQUE("site_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_header_links" ADD CONSTRAINT "site_header_links_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
