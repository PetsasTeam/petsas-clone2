-- AlterTable
ALTER TABLE "SeasonalPricing" ADD COLUMN     "basePrice15PlusDays" DOUBLE PRECISION,
ADD COLUMN     "basePrice3to6Days" DOUBLE PRECISION,
ADD COLUMN     "basePrice7to14Days" DOUBLE PRECISION;
