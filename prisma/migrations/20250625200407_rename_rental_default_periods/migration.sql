/*
  Warnings:

  - You are about to drop the column `adults` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `children` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "adults",
DROP COLUMN "children";
