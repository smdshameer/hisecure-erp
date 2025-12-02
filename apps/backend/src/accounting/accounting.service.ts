import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async exportSales(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // CSV Header
    let csv =
      'Invoice No,Date,Customer,Total Amount,Payment Method,Sold By,Items\n';

    sales.forEach((sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      const customer = sale.customer ? sale.customer.name : 'Walk-in';
      const items = sale.items
        .map((i) => `${i.product.name} (${i.quantity})`)
        .join('; ');

      // Escape commas in items to prevent CSV breakage
      const safeItems = `"${items}"`;

      csv += `${sale.invoiceNo},${date},${customer},${Number(sale.totalAmount)},${sale.paymentMethod},${sale.user.name},${safeItems}\n`;
    });

    return csv;
  }

  async exportPurchases(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const pos = await this.prisma.purchaseOrder.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // CSV Header
    let csv = 'PO Number,Date,Supplier,Status,Total Amount,Items\n';

    pos.forEach((po) => {
      const date = po.createdAt.toISOString().split('T')[0];
      const items = po.items
        .map((i) => `${i.product.name} (${i.quantity} @ ${Number(i.unitCost)})`)
        .join('; ');

      const safeItems = `"${items}"`;

      csv += `${po.poNumber},${date},${po.supplier.name},${po.status},${Number(po.totalAmount)},${safeItems}\n`;
    });

    return csv;
  }
}
