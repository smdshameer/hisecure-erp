import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockLedgerService {
    constructor(private prisma: PrismaService) { }

    async findAll(productIds?: number[]) {
        // Optional filter by filters
        const where = productIds ? { productId: { in: productIds } } : {};

        return this.prisma.stockLedger.findMany({
            where,
            include: {
                product: true,
                warehouse: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 100, // Limit for performance
        });
    }

    async findByProduct(productId: number) {
        return this.prisma.stockLedger.findMany({
            where: { productId },
            include: { warehouse: true },
            orderBy: { entryDate: 'desc' },
        });
    }
}
