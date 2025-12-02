-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "autoReorder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reorderQuantity" INTEGER NOT NULL DEFAULT 10;
