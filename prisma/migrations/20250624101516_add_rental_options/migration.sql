-- CreateTable
CREATE TABLE "RentalOption" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "maxQty" INTEGER NOT NULL DEFAULT 1,
    "priceType" TEXT NOT NULL DEFAULT 'per Day',
    "maxCost" DOUBLE PRECISION,
    "freeOverDays" INTEGER,
    "photo" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOptionPricing" (
    "id" TEXT NOT NULL,
    "rentalOptionId" TEXT NOT NULL,
    "vehicleGroups" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalOptionPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalOption_code_key" ON "RentalOption"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RentalOptionPricing_rentalOptionId_vehicleGroups_key" ON "RentalOptionPricing"("rentalOptionId", "vehicleGroups");

-- AddForeignKey
ALTER TABLE "RentalOptionPricing" ADD CONSTRAINT "RentalOptionPricing_rentalOptionId_fkey" FOREIGN KEY ("rentalOptionId") REFERENCES "RentalOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
