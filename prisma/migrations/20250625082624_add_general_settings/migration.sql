-- CreateTable
CREATE TABLE "GeneralSetting" (
    "id" TEXT NOT NULL,
    "maxRowsPerPage" INTEGER NOT NULL DEFAULT 500,
    "vatPercentage" DOUBLE PRECISION NOT NULL DEFAULT 19.0,
    "payOnArrivalDiscount" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "payOnlineDiscount" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "nextInvoiceNumber" TEXT NOT NULL DEFAULT '14312',
    "rentalMinDays" INTEGER NOT NULL DEFAULT 0,
    "rentalDefaultPeriods" TEXT NOT NULL DEFAULT '6',
    "ratedMaxDay1" INTEGER NOT NULL DEFAULT 6,
    "ratedMaxDay2" INTEGER NOT NULL DEFAULT 14,
    "ratedMaxDay3" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralSetting_pkey" PRIMARY KEY ("id")
);
