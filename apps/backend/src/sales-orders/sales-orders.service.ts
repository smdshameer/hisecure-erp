import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';

@Injectable()
export class SalesOrdersService {
    constructor(
        private prisma: PrismaService,
        private settings: SettingsService
    ) { }

    private async generateOrderNumber(tenantId: number): Promise<string> {
        const prefix = await this.settings.getValue<string>('docSeries.salesOrder.prefix') || 'SO-';
        const padding = await this.settings.getValue<number>('docSeries.salesOrder.padding') || 4;
        const count = await this.prisma.salesOrder.count({ where: { tenantId } });
        return `${prefix}${(count + 1).toString().padStart(padding, '0')}`;
    }

    async create(createDto: CreateSalesOrderDto, userId: number, tenantId: number = 1) {
        const { items, ...orderData } = createDto;
        const orderNumber = await this.generateOrderNumber(tenantId);

        return this.prisma.$transaction(async (prisma) => {
            const orderItems = items.map(item => ({
                productId: item.productId,
                orderedQty: item.orderedQty,
                dispatchedQty: 0,
                unit: item.unit || 'pcs',
                price: item.price,
                discount: item.discount || 0,
                taxRate: item.taxRate || 0,
                lineTotal: item.price * item.orderedQty,
                description: item.description,
            }));

            return prisma.salesOrder.create({
                data: {
                    tenantId,
                    orderNumber,
                    ...orderData,
                    status: 'DRAFT',
                    createdBy: userId,
                    items: { create: orderItems },
                },
                include: { items: true, customer: true }
            });
        });
    }

    async confirm(id: number, userId: number) {
        const order = await this.prisma.salesOrder.findUnique({ where: { id } });
        if (!order) throw new NotFoundException(`Order #${id} not found`);
        if (order.status !== 'DRAFT') throw new BadRequestException('Only DRAFT orders can be confirmed');

        return this.prisma.salesOrder.update({
            where: { id },
            data: { status: 'CONFIRMED' }
        });
    }

    async cancel(id: number, userId: number) {
        const order = await this.prisma.salesOrder.findUnique({ where: { id } });
        if (!order) throw new NotFoundException(`Order #${id} not found`);
        if (order.status === 'CANCELLED') throw new BadRequestException('Already cancelled');

        return this.prisma.salesOrder.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
    }

    async findAll(filters?: {
        dateFrom?: string;
        dateTo?: string;
        customerId?: number;
        status?: string;
        page?: number;
        pageSize?: number;
    }) {
        const where: any = {};
        if (filters?.customerId) where.customerId = filters.customerId;
        if (filters?.status) where.status = filters.status;
        if (filters?.dateFrom || filters?.dateTo) {
            where.orderDate = {};
            if (filters.dateFrom) where.orderDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo) where.orderDate.lte = new Date(filters.dateTo);
        }

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 50;

        const [data, total] = await Promise.all([
            this.prisma.salesOrder.findMany({
                where,
                include: { customer: true, creator: { select: { id: true, name: true } }, _count: { select: { items: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.salesOrder.count({ where })
        ]);

        return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    async findOne(id: number) {
        const order = await this.prisma.salesOrder.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                customer: true,
                creator: { select: { id: true, name: true } },
                quotation: true,
                deliveryChallans: { select: { id: true, challanNumber: true, status: true } }
            },
        });
        if (!order) throw new NotFoundException(`Order #${id} not found`);
        return order;
    }

    async update(id: number, updateDto: UpdateSalesOrderDto) {
        const order = await this.prisma.salesOrder.findUnique({ where: { id } });
        if (order?.status !== 'DRAFT') throw new BadRequestException('Only DRAFT orders can be edited');
        return this.prisma.salesOrder.update({ where: { id }, data: updateDto as any });
    }

    async remove(id: number) {
        const order = await this.prisma.salesOrder.findUnique({ where: { id } });
        if (order?.status !== 'DRAFT' && order?.status !== 'CANCELLED') {
            throw new BadRequestException('Only DRAFT or CANCELLED orders can be deleted');
        }
        return this.prisma.salesOrder.delete({ where: { id } });
    }
}
