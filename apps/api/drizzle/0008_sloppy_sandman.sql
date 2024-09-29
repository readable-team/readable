DO $$ BEGIN
 CREATE TYPE "public"."_billing_cycle" AS ENUM('MONTHLY', 'YEARLY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_payment_invoice_state" AS ENUM('PENDING', 'COMPLETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_payment_record_type" AS ENUM('SUCCESS', 'FAILURE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."_plan_type" AS ENUM('PUBLIC', 'PRIVATE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "addons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"fee" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"state" "_payment_invoice_state" DEFAULT 'PENDING' NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_records" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"method_id" text NOT NULL,
	"type" "_payment_record_type" NOT NULL,
	"amount" integer NOT NULL,
	"receipt_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_addons" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" text NOT NULL,
	"addon_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_addons_site_id_addon_id_unique" UNIQUE("site_id","addon_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"billing_cycle" "_billing_cycle" NOT NULL,
	"billing_email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_plans_team_id_unique" UNIQUE("team_id")
);
--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_plan_id_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "fee" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "type" "_plan_type" DEFAULT 'PUBLIC' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_invoices" ADD CONSTRAINT "payment_invoices_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_invoice_id_payment_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."payment_invoices"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_method_id_payment_methods_id_fk" FOREIGN KEY ("method_id") REFERENCES "public"."payment_methods"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_addons" ADD CONSTRAINT "site_addons_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "site_addons" ADD CONSTRAINT "site_addons_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_plans" ADD CONSTRAINT "team_plans_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_plans" ADD CONSTRAINT "team_plans_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN IF EXISTS "plan_id";