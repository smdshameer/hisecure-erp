import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';

@Injectable()
export class GoodsReceiptNoteService {
    constructor(
        private prisma: PrismaService,
        private settings: SettingsService
    ) { }

    private async generateGrnNumber(tenantId: number): Promise<string> {
        const prefix = await this.settings.getValue<string>('docSeries.grn.prefix') || 'GRN-';
        const padding = await this.settings.getValue<number>('docSeries.grn.padding') || 4;
        const count = await this.prisma.goodsReceiptNote.count({ where: { tenantId } });
        return `${prefix}${(count + 1).toString().padStart(padding, '0')}`;
    }

    async create(createDto: CreateGrnDto, userId: number, tenantId: number = 1) {
        const { items, ...grnData } = createDto;
        const grnNumber = await this.generateGrnNumber(tenantId);

        const grnItems = items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit || 'pcs',
            purchasePrice: item.purchasePrice,
            taxRate: item.taxRate || 0,
            lineTotal: item.purchasePrice * item.quantity,
            description: item.description,
        }));

        return this.prisma.goodsReceiptNote.create({
            data: {
                tenantId,
                grnNumber,
                ...grnData,
                status: 'DRAFT',
                createdBy: userId,
                items: { create: grnItems },
            },
            include: { items: true }
        });
    }

    async post(id: number, userId: number) {
        return this.prisma.$transaction(async (prisma) => {
            const grn = await prisma.goodsReceiptNote.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!grn) throw new NotFoundException(`GRN #${id} not found`);
            if (grn.status !== 'DRAFT') throw new BadRequestException('Only DRAFT GRNs can be posted');

            // Update stock for each item
            for (const item of grn.items) {
                await prisma.branchStock.upsert({
                    where: { branchId_productId: { branchId: grn.warehouseId, productId: item.productId } },
                    update: { quantity: { increment: item.quantity } },
                    create: { branchId: grn.warehouseId, productId: item.productId, quantity: item.quantity }
                });

                // Get updated balance
                const stock = await prisma.branchStock.findUnique({
                    where: { branchId_productId: { branchId: grn.warehouseId, productId: item.productId } }
                });

                // Create stock ledger entry
                await prisma.stockLedger.create({
                    data: {
                        tenantId: grn.tenantId,
                        qtyIn: item.quantity,
                        qtyOut: 0,
                        balanceQty: stock?.quantity || item.quantity,
                        refType: 'GRN',
                        refId: grn.id,
                        productId: item.productId,
                        warehouseId: grn.warehouseId,
                    }
                });
            }

            return prisma.goodsReceiptNote.update({
                where: { id },
                data: { status: 'POSTED' }
            });
        });
    }

    async cancel(id: number, userId: number) {
        return this.prisma.$transaction(async (prisma) => {
            const grn = await prisma.goodsReceiptNote.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!grn) throw new NotFoundException(`GRN #${id} not found`);
            if (grn.status === 'CANCELLED') throw new BadRequestException('Already cancelled');

            // Reverse stock if posted
            if (grn.status === 'POSTED') {
                for (const item of grn.items) {
                    await prisma.branchStock.update({
                        where: { branchId_productId: { branchId: grn.warehouseId, productId: item.productId } },
                        data: { quantity: { decrement: item.quantity } }
                    });
                }
            }

            return prisma.goodsReceiptNote.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });
        });
    }

    async findAll(filters?: {
        dateFrom?: string;
        dateTo?: string;
        supplierId?: number;
        warehouseId?: number;
        status?: string;
        page?: number;
        pageSize?: number;
    }) {
        const where: any = {};
        if (filters?.supplierId) where.supplierId = filters.supplierId;
        if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
        if (filters?.status) where.status = filters.status;
        if (filters?.dateFrom || filters?.dateTo) {
            where.grnDate = {};
            if (filters.dateFrom) where.grnDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo) where.grnDate.lte = new Date(filters.dateTo);
        }

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 50;

        const [data, total] = await Promise.all([
            this.prisma.goodsReceiptNote.findMany({
                where,
                include: { supplier: true, warehouse: true, _count: { select: { items: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.goodsReceiptNote.count({ where })
        ]);

        return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    async findOne(id: number) {
        const grn = await this.prisma.goodsReceiptNote.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                supplier: true,
                warehouse: true,
                creator: { select: { id: true, name: true } },
            },
        });
        if (!grn) throw new NotFoundException(`GRN #${id} not found`);
        return grn;
    }

    async update(id: number, updateDto: UpdateGrnDto) {
        const grn = await this.prisma.goodsReceiptNote.findUnique({ where: { id } });
        if (grn?.status !== 'DRAFT') throw new BadRequestException('Only DRAFT GRNs can be edited');
        return this.prisma.goodsReceiptNote.update({ where: { id }, data: updateDto as any });
    }

    async remove(id: number) {
        const grn = await this.prisma.goodsReceiptNote.findUnique({ where: { id } });
        if (grn?.status === 'POSTED') throw new BadRequestException('Cannot delete POSTED GRN');
        return this.prisma.goodsReceiptNote.delete({ where: { id } });
    }
}
