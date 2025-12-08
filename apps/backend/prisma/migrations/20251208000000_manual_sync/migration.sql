-- AlterTable
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "segment" TEXT;

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "quoteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "validityDate" TIMESTAMP(3);
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "remarks" TEXT;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "createdByUserId" INTEGER;

-- AlterTable
ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "DeliveryChallan" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "SalesInvoice" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "GoodsReceiptNote" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "StockLedger" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "SalesInvoiceItem" ADD COLUMN IF NOT EXISTS "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SalesOrderItem" ADD COLUMN IF NOT EXISTS "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "SalesOrderItem" ADD COLUMN IF NOT EXISTS "dispatchedQty" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "GRNItem" ADD COLUMN IF NOT EXISTS "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- Rename Column if it helps avoid data loss (though script uses orderedQty)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SalesOrderItem' AND column_name = 'quantity') THEN
        ALTER TABLE "SalesOrderItem" RENAME COLUMN "quantity" TO "orderedQty";
    END IF;
END
$$;
