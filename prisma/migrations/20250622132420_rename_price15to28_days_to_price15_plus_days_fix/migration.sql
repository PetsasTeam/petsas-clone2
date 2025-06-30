/*
  Warnings:

  - You are about to drop the column `price15to28Days` on the `SeasonalPricing` table. All the data in the column will be lost.
  - Added the required column `price15PlusDays` to the `SeasonalPricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SeasonalPricing" DROP COLUMN "price15to28Days",
ADD COLUMN     "price15PlusDays" DOUBLE PRECISION NOT NULL;
