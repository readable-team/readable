DO $$ BEGIN
 CREATE TYPE "public"."_category_state" AS ENUM('ACTIVE', 'DELETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_job_state" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_page_state" AS ENUM('DRAFT', 'PUBLISHED', 'DELETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_payment_method_state" AS ENUM('ACTIVE', 'DEACTIVATED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_single_sign_on_provider" AS ENUM('GOOGLE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_site_custom_domain_state" AS ENUM('ACTIVE', 'PENDING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_site_state" AS ENUM('ACTIVE', 'DELETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_team_member_role" AS ENUM('ADMIN', 'MEMBER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_team_state" AS ENUM('ACTIVE', 'DELETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_user_state" AS ENUM('ACTIVE', 'DEACTIVATED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"name" text NOT NULL,
	"state" "_category_state" DEFAULT 'ACTIVE' NOT NULL,
	"order" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_site_id_order_unique" UNIQUE("site_id","order")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "embeds" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"description" text,
	"html" text,
	"thumbnail_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "embeds_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"format" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"format" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"placeholder" text NOT NULL,
	"path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"lane" text NOT NULL,
	"name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"retries" integer DEFAULT 0 NOT NULL,
	"state" "_job_state" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_content_chunks" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"hash" text NOT NULL,
	"vector" vector(1536) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_content_contributors" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_content_contributors_page_id_user_id_unique" UNIQUE("page_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_content_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"snapshot" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_content_states" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"update" "bytea" NOT NULL,
	"vector" "bytea" NOT NULL,
	"up_to_seq" bigint NOT NULL,
	"title" text,
	"subtitle" text,
	"content" jsonb NOT NULL,
	"text" text NOT NULL,
	"hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_content_states_page_id_unique" UNIQUE("page_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_content_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"user_id" text NOT NULL,
	"update" "bytea" NOT NULL,
	"seq" bigint GENERATED ALWAYS AS IDENTITY (sequence name "page_content_updates_seq_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_contents" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"title" text,
	"subtitle" text,
	"content" jsonb NOT NULL,
	"text" text NOT NULL,
	"hash" text NOT NULL,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_contents_page_id_unique" UNIQUE("page_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"category_id" text NOT NULL,
	"parent_id" text,
	"slug" text NOT NULL,
	"state" "_page_state" NOT NULL,
	"order" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_site_id_slug_unique" UNIQUE("site_id","slug"),
	CONSTRAINT "pages_site_id_parent_id_order_unique" UNIQUE NULLS NOT DISTINCT("site_id","parent_id","order")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"name" text NOT NULL,
	"billing_key" text NOT NULL,
	"state" "_payment_method_state" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rules" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pubsubs" (
	"id" text PRIMARY KEY NOT NULL,
	"channel" text NOT NULL,
	"payload" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_custom_domains" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"domain" text NOT NULL,
	"state" "_site_custom_domain_state" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"state" "_site_state" DEFAULT 'ACTIVE' NOT NULL,
	"logo_id" text,
	"theme_color" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_member_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "team_member_invitations_team_id_email_unique" UNIQUE("team_id","email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "_team_member_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_user_id_team_id_unique" UNIQUE("user_id","team_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"state" "_team_state" DEFAULT 'ACTIVE' NOT NULL,
	"plan_id" text NOT NULL,
	"avatar_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_single_sign_ons" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" "_single_sign_on_provider" NOT NULL,
	"principal" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_single_sign_ons_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_single_sign_ons_provider_principal_unique" UNIQUE("provider","principal")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar_id" text NOT NULL,
	"state" "_user_state" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_content_chunks" ADD CONSTRAINT "page_content_chunks_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_content_contributors" ADD CONSTRAINT "page_content_contributors_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_content_contributors" ADD CONSTRAINT "page_content_contributors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_content_snapshots" ADD CONSTRAINT "page_content_snapshots_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_content_states" ADD CONSTRAINT "page_content_states_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_content_updates" ADD CONSTRAINT "page_content_updates_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_content_updates" ADD CONSTRAINT "page_content_updates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_contents" ADD CONSTRAINT "page_contents_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pages" ADD CONSTRAINT "pages_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_custom_domains" ADD CONSTRAINT "site_custom_domains_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sites" ADD CONSTRAINT "sites_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sites" ADD CONSTRAINT "sites_logo_id_images_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member_invitations" ADD CONSTRAINT "team_member_invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_avatar_id_images_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_single_sign_ons" ADD CONSTRAINT "user_single_sign_ons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_images_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."images"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_lane_state_created_at_index" ON "jobs" USING btree ("lane","state","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vector_cosine_similarity_idx" ON "page_content_chunks" USING hnsw ("vector" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_content_contributors_page_id_updated_at_index" ON "page_content_contributors" USING btree ("page_id","updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_content_snapshots_page_id_created_at_index" ON "page_content_snapshots" USING btree ("page_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_content_updates_page_id_seq_index" ON "page_content_updates" USING btree ("page_id","seq");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_contents_page_id_created_at_index" ON "page_contents" USING btree ("page_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_site_id_state_index" ON "pages" USING btree ("site_id","state");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payment_methods_team_id_index" ON "payment_methods" USING btree ("team_id") WHERE "payment_methods"."state" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "site_custom_domains_domain_state_index" ON "site_custom_domains" USING btree ("domain","state");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "site_custom_domains_domain_index" ON "site_custom_domains" USING btree ("domain") WHERE "site_custom_domains"."state" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sites_slug_state_index" ON "sites" USING btree ("slug","state");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sites_slug_index" ON "sites" USING btree ("slug") WHERE "sites"."state" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sites_team_id_state_index" ON "sites" USING btree ("team_id","state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_members_team_id_user_id_role_index" ON "team_members" USING btree ("team_id","user_id","role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teams_state_index" ON "teams" USING btree ("state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_sessions_user_id_index" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_state_index" ON "users" USING btree ("email","state");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_index" ON "users" USING btree ("email") WHERE "users"."state" = 'ACTIVE';