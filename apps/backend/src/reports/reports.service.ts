import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalSales = await this.prisma.sale.aggregate({
      _sum: { totalAmount: true },
    });

    const totalOrders = await this.prisma.sale.count();

    const lowStockCount = await this.prisma.product.count({
      where: { stockQuantity: { lte: 10 } }, // Threshold 10
    });

    const pendingTickets = await this.prisma.serviceTicket.count({
      where: { status: { not: 'COMPLETED' } },
    });

    return {
      totalRevenue: totalSales._sum.totalAmount || 0,
      totalOrders,
      lowStockCount,
      pendingTickets,
    };
  }

  async getLowStockProducts() {
    return this.prisma.product.findMany({
      where: { stockQuantity: { lte: 10 } },
      orderBy: { stockQuantity: 'asc' },
    });
  }

  async getRecentSales() {
    return this.prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }
}
