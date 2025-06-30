/*
  Warnings:

  - You are about to drop the column `ratedMaxDay1` on the `GeneralSetting` table. All the data in the column will be lost.
  - You are about to drop the column `ratedMaxDay2` on the `GeneralSetting` table. All the data in the column will be lost.
  - You are about to drop the column `ratedMaxDay3` on the `GeneralSetting` table. All the data in the column will be lost.
  - You are about to drop the column `rentalMinDays` on the `GeneralSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GeneralSetting" DROP COLUMN "ratedMaxDay1",
DROP COLUMN "ratedMaxDay2",
DROP COLUMN "ratedMaxDay3",
DROP COLUMN "rentalMinDays";
