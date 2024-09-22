ALTER TABLE "categories" ADD COLUMN "slug" text;

UPDATE "categories" SET "slug" = "id";

ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "categories" ADD CONSTRAINT "categories_site_id_slug_unique" UNIQUE("site_id","slug");