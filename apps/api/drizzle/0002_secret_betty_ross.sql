CREATE TABLE IF NOT EXISTS "page_content_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"snapshot" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_content_snapshots" ADD CONSTRAINT "page_content_snapshots_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_content_snapshots_page_id_created_at_index" ON "page_content_snapshots" USING btree ("page_id","created_at");