-- 1. Customer Updates
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "segment" TEXT;

-- 2. Settings Module
CREATE TABLE IF NOT EXISTS "Setting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDeveloper" BOOLEAN NOT NULL DEFAULT false,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "requiresRestart" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key" ON "Setting"("key");

CREATE TABLE IF NOT EXISTS "SettingHistory" (
    "id" SERIAL NOT NULL,
    "settingId" INTEGER NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "version" INTEGER NOT NULL,
    "changedBy" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SettingHistory_pkey" PRIMARY KEY ("id")
);

-- 3. Quotation Module
CREATE TABLE IF NOT EXISTS "Quotation" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL DEFAULT 1,
    "quotationNo" TEXT NOT NULL,
    "quoteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "validityDate" TIMESTAMP(3),
    "remarks" TEXT,
    "subTotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cgst" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sgst" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "igst" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" INTEGER NOT NULL,
    "createdByUserId" INTEGER,
    "validUntil" TIMESTAMP(3),
    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Quotation_quotationNo_key" ON "Quotation"("quotationNo");

CREATE TABLE IF NOT EXISTS "QuotationItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "quotationId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- 4. Sales Order Module
CREATE TABLE IF NOT EXISTS "SalesOrder" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL DEFAULT 1,
    "orderNumber" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "customerId" INTEGER NOT NULL,
    "quotationId" INTEGER,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SalesOrder_orderNumber_key" ON "SalesOrder"("orderNumber");

CREATE TABLE IF NOT EXISTS "SalesOrderItem" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "orderedQty" INTEGER NOT NULL,
    "dispatchedQty" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "price" DECIMAL(65,30) NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(65,30) NOT NULL,
    "salesOrderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- 5. Delivery Challan Module
CREATE TABLE IF NOT EXISTS "DeliveryChallan" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL DEFAULT 1,
    "challanNumber" TEXT NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'SO',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "customerId" INTEGER,
    "fromWarehouseId" INTEGER NOT NULL,
    "toWarehouseId" INTEGER,
    "salesOrderId" INTEGER,
    "createdBy" INTEGER NOT NULL,
    "approvedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryChallan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DeliveryChallan_challanNumber_key" ON "DeliveryChallan"("challanNumber");

CREATE TABLE IF NOT EXISTS "DeliveryChallanItem" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "serialNumbers" TEXT,
    "deliveryChallanId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "linkedSalesOrderItemId" INTEGER,
    CONSTRAINT "DeliveryChallanItem_pkey" PRIMARY KEY ("id")
);

-- 6. Sales Invoice Module
CREATE TABLE IF NOT EXISTS "SalesInvoice" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL DEFAULT 1,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "totalBeforeTax" DECIMAL(65,30) NOT NULL,
    "totalTax" DECIMAL(65,30) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesInvoice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SalesInvoice_invoiceNumber_key" ON "SalesInvoice"("invoiceNumber");

CREATE TABLE IF NOT EXISTS "SalesInvoiceItem" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "price" DECIMAL(65,30) NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(65,30) NOT NULL,
    "salesInvoiceId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "SalesInvoiceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SalesInvoiceDeliveryChallan" (
    "id" SERIAL NOT NULL,
    "salesInvoiceId" INTEGER NOT NULL,
    "deliveryChallanId" INTEGER NOT NULL,
    CONSTRAINT "SalesInvoiceDeliveryChallan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SalesInvoiceDeliveryChallan_salesInvoiceId_deliveryChallanId_key" ON "SalesInvoiceDeliveryChallan"("salesInvoiceId", "deliveryChallanId");

-- 7. Goods Receipt Note Module
CREATE TABLE IF NOT EXISTS "GoodsReceiptNote" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL DEFAULT 1,
    "grnNumber" TEXT NOT NULL,
    "grnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "supplierId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoodsReceiptNote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GoodsReceiptNote_grnNumber_key" ON "GoodsReceiptNote"("grnNumber");

CREATE TABLE IF NOT EXISTS "GRNItem" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "purchasePrice" DECIMAL(65,30) NOT NULL,
    "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(65,30) NOT NULL,
    "grnId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "GRNItem_pkey" PRIMARY KEY ("id")
);

-- 8. Stock Ledger Module
CREATE TABLE IF NOT EXISTS "StockLedger" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL DEFAULT 1,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qtyIn" INTEGER NOT NULL DEFAULT 0,
    "qtyOut" INTEGER NOT NULL DEFAULT 0,
    "balanceQty" INTEGER NOT NULL,
    "refType" TEXT NOT NULL,
    "refId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockLedger_pkey" PRIMARY KEY ("id")
);

-- 9. Audit Log
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "userId" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "reason" TEXT,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);


-- Ensure Columns exist (Safeguard for when table existed but columns missing)
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "quoteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "validityDate" TIMESTAMP(3);
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "remarks" TEXT;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "createdByUserId" INTEGER;

ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "DeliveryChallan" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "SalesInvoice" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "GoodsReceiptNote" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "StockLedger" ADD COLUMN IF NOT EXISTS "tenantId" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "SalesInvoiceItem" ADD COLUMN IF NOT EXISTS "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0;

ALTER TABLE "SalesOrderItem" ADD COLUMN IF NOT EXISTS "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "SalesOrderItem" ADD COLUMN IF NOT EXISTS "dispatchedQty" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SalesOrderItem" ADD COLUMN IF NOT EXISTS "orderedQty" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "GRNItem" ADD COLUMN IF NOT EXISTS "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0;
