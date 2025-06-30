/*
  Warnings:

  - You are about to drop the column `rentalDefaultPeriods` on the `GeneralSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GeneralSetting" DROP COLUMN "rentalDefaultPeriods",
ADD COLUMN     "minDaysForFreeSCDWTWU" TEXT NOT NULL DEFAULT '6';

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "adults" INTEGER,
ADD COLUMN     "children" INTEGER;
