ALTER TABLE "pages" DROP CONSTRAINT "pages_site_id_slug_unique";--> statement-breakpoint
ALTER TABLE "pages" DROP CONSTRAINT "pages_site_id_parent_id_order_unique";--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_category_id_parent_id_slug_unique" UNIQUE NULLS NOT DISTINCT("site_id","category_id","parent_id","slug");--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_category_id_parent_id_order_unique" UNIQUE NULLS NOT DISTINCT("site_id","category_id","parent_id","order");