-- AlterTable
ALTER TABLE "VehicleCategory" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;
