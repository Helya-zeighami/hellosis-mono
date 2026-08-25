/*
  Warnings:

  - You are about to drop the column `placeId` on the `events` table. All the data in the column will be lost.
  - Added the required column `cityId` to the `events` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_placeId_fkey";

-- DropIndex
DROP INDEX "events_placeId_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "placeId",
ADD COLUMN     "cityId" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- CreateIndex
CREATE INDEX "events_cityId_idx" ON "events"("cityId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
