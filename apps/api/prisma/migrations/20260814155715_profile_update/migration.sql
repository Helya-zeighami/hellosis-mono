/*
  Warnings:

  - The primary key for the `user_interests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `user_interests` table. All the data in the column will be lost.
  - Added the required column `profileId` to the `user_interests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_interests" DROP CONSTRAINT "user_interests_userId_fkey";

-- AlterTable
ALTER TABLE "user_interests" DROP CONSTRAINT "user_interests_pkey",
DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL,
ADD CONSTRAINT "user_interests_pkey" PRIMARY KEY ("profileId", "interestId");

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
