-- AlterTable
ALTER TABLE "GeneralSetting" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "glassmorphismEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "socialFacebook" TEXT,
ADD COLUMN     "socialInstagram" TEXT,
ADD COLUMN     "socialLinkedin" TEXT,
ADD COLUMN     "socialTwitter" TEXT;
