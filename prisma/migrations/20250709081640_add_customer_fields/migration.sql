-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "password" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
