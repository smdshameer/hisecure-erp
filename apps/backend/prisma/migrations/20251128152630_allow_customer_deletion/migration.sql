-- DropForeignKey
ALTER TABLE "ServiceTicket" DROP CONSTRAINT "ServiceTicket_customerId_fkey";

-- AddForeignKey
ALTER TABLE "ServiceTicket" ADD CONSTRAINT "ServiceTicket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
