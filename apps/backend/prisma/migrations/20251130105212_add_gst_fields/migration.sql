-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "gstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "hsnCode" TEXT;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "cgst" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "igst" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sgst" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subTotal" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "cgst" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "igst" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sgst" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subTotal" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateTable
CREATE TABLE "GSTConfig" (
    "id" SERIAL NOT NULL,
    "gstin" TEXT,
    "state" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GSTConfig_pkey" PRIMARY KEY ("id")
);
