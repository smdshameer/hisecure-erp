import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardData() {
        // 1. Total Revenue & Orders
        const sales = await this.prisma.sale.findMany({
            include: { items: true },
        });

        const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        const totalOrders = sales.length;

        // 2. Low Stock Count
        const lowStockCount = await this.prisma.product.count({
            where: {
                stockQuantity: {
                    lte: 10, // Hardcoded threshold or fetch from DB if dynamic
                },
            },
        });

        // 3. Top Selling Products
        const productSales: Record<number, number> = {};
        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
            });
        });

        const sortedProductIds = Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([id]) => Number(id));

        const topProducts = await this.prisma.product.findMany({
            where: { id: { in: sortedProductIds } },
            select: { id: true, name: true },
        });

        const topProductsWithCount = topProducts.map((p) => ({
            name: p.name,
            sales: productSales[p.id],
        }));

        // 4. Recent Sales
        const recentSales = await this.prisma.sale.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
        });

        return {
            totalRevenue,
            totalOrders,
            lowStockCount,
            topProducts: topProductsWithCount,
            recentSales,
        };
    }
}
