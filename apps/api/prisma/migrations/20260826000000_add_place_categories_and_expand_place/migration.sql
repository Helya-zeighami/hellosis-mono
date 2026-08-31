-- CreateTable
CREATE TABLE "place_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "place_categories_name_key" ON "place_categories"("name");

-- AlterTable: Add new columns to places
ALTER TABLE "places" ADD COLUMN "description" TEXT;
ALTER TABLE "places" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "places" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "places" ADD COLUMN "createdById" TEXT;
ALTER TABLE "places" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropColumns
ALTER TABLE "places" DROP COLUMN "latitude";
ALTER TABLE "places" DROP COLUMN "longitude";

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "place_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SeedPlaceCategories
INSERT INTO "place_categories" ("id", "name", "createdAt") VALUES
  ('cat_cafe', 'Cafe', CURRENT_TIMESTAMP),
  ('cat_restaurant', 'Restaurant', CURRENT_TIMESTAMP),
  ('cat_park', 'Park', CURRENT_TIMESTAMP),
  ('cat_bookstore', 'Bookstore', CURRENT_TIMESTAMP),
  ('cat_gym', 'Gym', CURRENT_TIMESTAMP),
  ('cat_coworking', 'Co-working Space', CURRENT_TIMESTAMP),
  ('cat_library', 'Library', CURRENT_TIMESTAMP),
  ('cat_cultural', 'Cultural Center', CURRENT_TIMESTAMP),
  ('cat_shop', 'Shop', CURRENT_TIMESTAMP),
  ('cat_other', 'Other', CURRENT_TIMESTAMP);
