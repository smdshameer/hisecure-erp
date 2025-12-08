import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockLedgerService {
    constructor(private prisma: PrismaService) { }

    async findAll(filters?: {
        productId?: number;
        warehouseId?: number;
        refType?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        pageSize?: number;
    }) {
        const where: any = {};
        if (filters?.productId) where.productId = filters.productId;
        if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
        if (filters?.refType) where.refType = filters.refType;
        if (filters?.dateFrom || filters?.dateTo) {
            where.entryDate = {};
            if (filters.dateFrom) where.entryDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo) where.entryDate.lte = new Date(filters.dateTo);
        }

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 100;

        const [data, total] = await Promise.all([
            this.prisma.stockLedger.findMany({
                where,
                include: {
                    product: { select: { id: true, name: true, sku: true } },
                    warehouse: { select: { id: true, name: true } }
                },
                orderBy: { entryDate: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.stockLedger.count({ where })
        ]);

        return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    async findByProduct(productId: number, warehouseId?: number) {
        const where: any = { productId };
        if (warehouseId) where.warehouseId = warehouseId;

        return this.prisma.stockLedger.findMany({
            where,
            include: {
                warehouse: { select: { id: true, name: true } }
            },
            orderBy: { entryDate: 'desc' },
            take: 100,
        });
    }

    async getStockSummary(productId: number) {
        const stocks = await this.prisma.branchStock.findMany({
            where: { productId },
            include: { branch: { select: { id: true, name: true } } }
        });

        const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);

        return {
            productId,
            totalStock,
            warehouses: stocks.map(s => ({
                warehouseId: s.branchId,
                warehouseName: s.branch.name,
                quantity: s.quantity
            }))
        };
    }

    // Centralized stock movement method (for future use)
    async createStockMovement(params: {
        tenantId: number;
        productId: number;
        warehouseId: number;
        qtyIn: number;
        qtyOut: number;
        refType: string;
        refId: number;
    }) {
        return this.prisma.$transaction(async (prisma) => {
            // Update BranchStock
            const netChange = params.qtyIn - params.qtyOut;

            await prisma.branchStock.upsert({
                where: { branchId_productId: { branchId: params.warehouseId, productId: params.productId } },
                update: { quantity: { increment: netChange } },
                create: { branchId: params.warehouseId, productId: params.productId, quantity: netChange }
            });

            // Get new balance
            const stock = await prisma.branchStock.findUnique({
                where: { branchId_productId: { branchId: params.warehouseId, productId: params.productId } }
            });

            // Create ledger entry
            return prisma.stockLedger.create({
                data: {
                    tenantId: params.tenantId,
                    productId: params.productId,
                    warehouseId: params.warehouseId,
                    qtyIn: params.qtyIn,
                    qtyOut: params.qtyOut,
                    balanceQty: stock?.quantity || 0,
                    refType: params.refType,
                    refId: params.refId,
                }
            });
        });
    }
}
