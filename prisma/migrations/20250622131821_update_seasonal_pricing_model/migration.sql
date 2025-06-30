/*
  Warnings:

  - You are about to drop the column `pricePerDay` on the `SeasonalPricing` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryId,seasonId,group]` on the table `SeasonalPricing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group` to the `SeasonalPricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price15to28Days` to the `SeasonalPricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price3to6Days` to the `SeasonalPricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price7to14Days` to the `SeasonalPricing` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SeasonalPricing_categoryId_seasonId_key";

-- AlterTable
ALTER TABLE "SeasonalPricing" DROP COLUMN "pricePerDay",
ADD COLUMN     "group" TEXT NOT NULL,
ADD COLUMN     "price15to28Days" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price3to6Days" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price7to14Days" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SeasonalPricing_categoryId_seasonId_group_key" ON "SeasonalPricing"("categoryId", "seasonId", "group");
