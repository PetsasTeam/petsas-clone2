/*
  Warnings:

  - You are about to drop the column `fuelType` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasABS` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasAirbags` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasBluetooth` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasCDPlayer` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasElectricWindows` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasGPS` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasPowerSteering` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasRadio` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasRemoteLocking` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `hasUSB` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "fuelType",
DROP COLUMN "hasABS",
DROP COLUMN "hasAirbags",
DROP COLUMN "hasBluetooth",
DROP COLUMN "hasCDPlayer",
DROP COLUMN "hasElectricWindows",
DROP COLUMN "hasGPS",
DROP COLUMN "hasPowerSteering",
DROP COLUMN "hasRadio",
DROP COLUMN "hasRemoteLocking",
DROP COLUMN "hasUSB",
ADD COLUMN     "adults" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "children" INTEGER NOT NULL DEFAULT 0;
