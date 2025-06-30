-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "city" TEXT,
    "postcode" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "openingHours" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "instructions" TEXT,
    "facilities" TEXT,
    "isPickupPoint" BOOLEAN NOT NULL DEFAULT true,
    "isDropoffPoint" BOOLEAN NOT NULL DEFAULT true,
    "hasDelivery" BOOLEAN NOT NULL DEFAULT false,
    "deliveryRadius" INTEGER,
    "deliveryFee" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);
