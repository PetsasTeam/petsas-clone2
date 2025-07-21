-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookingId" TEXT,
    "orderId" TEXT,
    "orderNumber" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "customerEmail" TEXT,
    "customerFirstName" TEXT,
    "customerLastName" TEXT,
    "customerPhone" TEXT,
    "paymentType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "jccOrderId" TEXT,
    "jccStatus" TEXT,
    "jccErrorCode" TEXT,
    "jccErrorMessage" TEXT,
    "jccFormUrl" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "processingTime" INTEGER,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "rawJccResponse" TEXT,
    "errorDetails" TEXT,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentLog_bookingId_idx" ON "PaymentLog"("bookingId");

-- CreateIndex
CREATE INDEX "PaymentLog_orderId_idx" ON "PaymentLog"("orderId");

-- CreateIndex
CREATE INDEX "PaymentLog_customerEmail_idx" ON "PaymentLog"("customerEmail");

-- CreateIndex
CREATE INDEX "PaymentLog_status_idx" ON "PaymentLog"("status");

-- CreateIndex
CREATE INDEX "PaymentLog_createdAt_idx" ON "PaymentLog"("createdAt");

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
