import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateDeliveryChallanDto } from './dto/create-delivery-challan.dto';
import { UpdateDeliveryChallanDto } from './dto/update-delivery-challan.dto';

@Injectable()
export class DeliveryChallanService {
    constructor(
        private prisma: PrismaService,
        private settings: SettingsService
    ) { }

    private async generateChallanNumber(tenantId: number): Promise<string> {
        const prefix = await this.settings.getValue<string>('docSeries.deliveryChallan.prefix') || 'DC-';
        const padding = await this.settings.getValue<number>('docSeries.deliveryChallan.padding') || 4;
        const count = await this.prisma.deliveryChallan.count({ where: { tenantId } });
        return `${prefix}${(count + 1).toString().padStart(padding, '0')}`;
    }

    async create(createDto: CreateDeliveryChallanDto, userId: number, tenantId: number = 1) {
        const { items, ...challanData } = createDto;

        const requireSO = await this.settings.getValue<boolean>('sales.requireSalesOrderForDC');
        if (requireSO && !challanData.salesOrderId) {
            throw new BadRequestException('Sales Order is required for Delivery Challan (System Setting)');
        }

        const challanNumber = await this.generateChallanNumber(tenantId);
        const fromBranch = await this.prisma.branch.findUnique({ where: { id: challanData.fromWarehouseId } });
        if (!fromBranch) throw new NotFoundException('Source Warehouse not found');

        return this.prisma.deliveryChallan.create({
            data: {
                tenantId,
                challanNumber,
                ...challanData,
                status: 'DRAFT',
                createdBy: userId,
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unit: item.unit,
                        description: item.description,
                        serialNumbers: item.serialNumbers,
                    }))
                },
            },
            include: { items: true }
        });
    }

    async dispatch(id: number, userId: number) {
        return this.prisma.$transaction(async (prisma) => {
            const dc = await prisma.deliveryChallan.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!dc) throw new NotFoundException(`DC #${id} not found`);
            if (dc.status !== 'DRAFT') throw new BadRequestException(`DC must be in DRAFT status to dispatch`);

            const allowNegative = await this.settings.getValue<boolean>('sales.allowNegativeStockOnDC');

            for (const item of dc.items) {
                const stock = await prisma.branchStock.findUnique({
                    where: { branchId_productId: { branchId: dc.fromWarehouseId, productId: item.productId } }
                });

                const currentQty = stock ? stock.quantity : 0;

                if (!allowNegative && currentQty < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for Product ID ${item.productId}`);
                }

                if (stock) {
                    await prisma.branchStock.update({
                        where: { id: stock.id },
                        data: { quantity: { decrement: item.quantity } }
                    });
                } else {
                    await prisma.branchStock.create({
                        data: { branchId: dc.fromWarehouseId, productId: item.productId, quantity: -item.quantity }
                    });
                }

                if (dc.type === 'TRANSFER' && dc.toWarehouseId) {
                    await prisma.branchStock.upsert({
                        where: { branchId_productId: { branchId: dc.toWarehouseId, productId: item.productId } },
                        update: { quantity: { increment: item.quantity } },
                        create: { branchId: dc.toWarehouseId, productId: item.productId, quantity: item.quantity }
                    });
                }

                await prisma.stockLedger.create({
                    data: {
                        tenantId: dc.tenantId,
                        qtyIn: 0,
                        qtyOut: item.quantity,
                        balanceQty: currentQty - item.quantity,
                        refType: 'DELIVERY_CHALLAN',
                        refId: dc.id,
                        productId: item.productId,
                        warehouseId: dc.fromWarehouseId,
                    }
                });
            }

            return prisma.deliveryChallan.update({
                where: { id },
                data: { status: 'DISPATCHED', approvedBy: userId }
            });
        });
    }

    async cancel(id: number, userId: number) {
        return this.prisma.$transaction(async (prisma) => {
            const dc = await prisma.deliveryChallan.findUnique({
                where: { id },
                include: { items: true }
            });
            if (!dc) throw new NotFoundException(`DC #${id} not found`);
            if (dc.status === 'CANCELLED') throw new BadRequestException('Already cancelled');

            if (dc.status === 'DISPATCHED') {
                for (const item of dc.items) {
                    await prisma.branchStock.update({
                        where: { branchId_productId: { branchId: dc.fromWarehouseId, productId: item.productId } },
                        data: { quantity: { increment: item.quantity } }
                    });

                    if (dc.type === 'TRANSFER' && dc.toWarehouseId) {
                        await prisma.branchStock.update({
                            where: { branchId_productId: { branchId: dc.toWarehouseId, productId: item.productId } },
                            data: { quantity: { decrement: item.quantity } }
                        });
                    }
                }
            }

            return prisma.deliveryChallan.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });
        });
    }

    async findAll(filters?: {
        dateFrom?: string;
        dateTo?: string;
        customerId?: number;
        status?: string;
        type?: string;
        warehouseId?: number;
        page?: number;
        pageSize?: number;
    }) {
        const where: any = {};

        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.status) where.status = filters.status;
        if (filters?.type) where.type = filters.type;
        if (filters?.warehouseId) where.fromWarehouseId = filters.warehouseId;
        if (filters?.dateFrom || filters?.dateTo) {
            where.challanDate = {};
            if (filters.dateFrom) where.challanDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo) where.challanDate.lte = new Date(filters.dateTo);
        }

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 50;

        const [data, total] = await Promise.all([
            this.prisma.deliveryChallan.findMany({
                where,
                include: {
                    customer: true,
                    fromWarehouse: true,
                    toWarehouse: true,
                    _count: { select: { items: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.deliveryChallan.count({ where })
        ]);

        return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    async findOne(id: number) {
        const dc = await this.prisma.deliveryChallan.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                customer: true,
                fromWarehouse: true,
                toWarehouse: true,
                creator: { select: { id: true, name: true } },
                salesOrder: true,
                invoiceLinks: { include: { salesInvoice: true } }
            },
        });
        if (!dc) throw new NotFoundException(`Delivery Challan #${id} not found`);
        return dc;
    }

    async getPrintData(id: number) {
        const dc = await this.findOne(id);
        const companyName = await this.settings.getValue<string>('company.name') || 'HiSecure ERP';
        return { ...dc, companyName };
    }

    async update(id: number, updateDto: UpdateDeliveryChallanDto) {
        const dc = await this.prisma.deliveryChallan.findUnique({ where: { id } });
        if (dc?.status !== 'DRAFT') throw new BadRequestException('Only DRAFT documents can be edited');
        return this.prisma.deliveryChallan.update({ where: { id }, data: updateDto as any });
    }

    async remove(id: number) {
        const dc = await this.prisma.deliveryChallan.findUnique({ where: { id } });
        if (dc?.status === 'DISPATCHED') throw new BadRequestException('Cannot delete DISPATCHED document');
        return this.prisma.deliveryChallan.delete({ where: { id } });
    }
}
