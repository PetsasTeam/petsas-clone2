-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "invoiceNo" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
ADD COLUMN     "paymentType" TEXT NOT NULL DEFAULT 'On Arrival',
ADD COLUMN     "transactionId" TEXT;
