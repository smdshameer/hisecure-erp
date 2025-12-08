import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

@Injectable()
export class QuotationsService {
    constructor(
        private prisma: PrismaService,
        private settings: SettingsService
    ) { }

    private async generateQuotationNumber(tenantId: number): Promise<string> {
        const prefix = await this.settings.getValue<string>('docSeries.salesQuotation.prefix') || 'QT-';
        const padding = await this.settings.getValue<number>('docSeries.salesQuotation.padding') || 4;
        const count = await this.prisma.quotation.count({ where: { tenantId } });
        return `${prefix}${(count + 1).toString().padStart(padding, '0')}`;
    }

    async create(createDto: CreateQuotationDto, userId: number, tenantId: number = 1) {
        const { items, ...quotationData } = createDto;
        const quotationNo = await this.generateQuotationNumber(tenantId);

        let subTotal = 0;
        const quotationItems = items.map(item => {
            const lineTotal = item.unitPrice * item.quantity;
            subTotal += lineTotal;
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            };
        });

        // Simple tax calculation (18% default)
        const taxRate = 18;
        const taxAmount = (subTotal * taxRate) / 100;
        const cgst = taxAmount / 2;
        const sgst = taxAmount / 2;
        const totalAmount = subTotal + taxAmount;

        return this.prisma.quotation.create({
            data: {
                tenantId,
                quotationNo,
                customerId: quotationData.customerId,
                quoteDate: quotationData.quoteDate ? new Date(quotationData.quoteDate) : new Date(),
                validityDate: quotationData.validityDate ? new Date(quotationData.validityDate) : undefined,
                remarks: quotationData.remarks,
                status: 'DRAFT',
                subTotal,
                cgst,
                sgst,
                igst: 0,
                totalAmount,
                createdByUserId: userId,
                items: { create: quotationItems },
            },
            include: { items: true, customer: true }
        });
    }

    async send(id: number, userId: number) {
        const quote = await this.prisma.quotation.findUnique({ where: { id } });
        if (!quote) throw new NotFoundException(`Quotation #${id} not found`);
        if (quote.status !== 'DRAFT') throw new BadRequestException('Only DRAFT quotations can be sent');
        return this.prisma.quotation.update({ where: { id }, data: { status: 'SENT' } });
    }

    async accept(id: number, userId: number) {
        const quote = await this.prisma.quotation.findUnique({ where: { id } });
        if (!quote) throw new NotFoundException(`Quotation #${id} not found`);
        if (quote.status !== 'SENT') throw new BadRequestException('Only SENT quotations can be accepted');
        return this.prisma.quotation.update({ where: { id }, data: { status: 'ACCEPTED' } });
    }

    async reject(id: number, userId: number) {
        const quote = await this.prisma.quotation.findUnique({ where: { id } });
        if (!quote) throw new NotFoundException(`Quotation #${id} not found`);
        if (quote.status !== 'SENT') throw new BadRequestException('Only SENT quotations can be rejected');
        return this.prisma.quotation.update({ where: { id }, data: { status: 'REJECTED' } });
    }

    async cancel(id: number, userId: number) {
        const quote = await this.prisma.quotation.findUnique({ where: { id } });
        if (!quote) throw new NotFoundException(`Quotation #${id} not found`);
        return this.prisma.quotation.update({ where: { id }, data: { status: 'CANCELLED' } });
    }

    async convertToSalesOrder(id: number, userId: number) {
        const quote = await this.prisma.quotation.findUnique({
            where: { id },
            include: { items: { include: { product: true } } }
        });

        if (!quote) throw new NotFoundException(`Quotation #${id} not found`);
        if (quote.status !== 'ACCEPTED') throw new BadRequestException('Only ACCEPTED quotations can be converted');

        const prefix = await this.settings.getValue<string>('docSeries.salesOrder.prefix') || 'SO-';
        const padding = await this.settings.getValue<number>('docSeries.salesOrder.padding') || 4;
        const count = await this.prisma.salesOrder.count({ where: { tenantId: quote.tenantId } });
        const orderNumber = `${prefix}${(count + 1).toString().padStart(padding, '0')}`;

        const orderItems = quote.items.map(item => ({
            productId: item.productId,
            orderedQty: item.quantity,
            dispatchedQty: 0,
            unit: 'pcs',
            price: item.unitPrice,
            discount: 0,
            taxRate: 18,
            lineTotal: Number(item.unitPrice) * item.quantity,
        }));

        return this.prisma.salesOrder.create({
            data: {
                tenantId: quote.tenantId,
                orderNumber,
                orderDate: new Date(),
                customerId: quote.customerId,
                quotationId: quote.id,
                status: 'DRAFT',
                createdBy: userId,
                items: { create: orderItems },
            },
            include: { items: true, customer: true }
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
            where.quoteDate = {};
            if (filters.dateFrom) where.quoteDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo) where.quoteDate.lte = new Date(filters.dateTo);
        }

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 50;

        const [data, total] = await Promise.all([
            this.prisma.quotation.findMany({
                where,
                include: { customer: true, _count: { select: { items: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.quotation.count({ where })
        ]);

        return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    async findOne(id: number) {
        const quote = await this.prisma.quotation.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                customer: true,
                salesOrders: { select: { id: true, orderNumber: true, status: true } }
            },
        });
        if (!quote) throw new NotFoundException(`Quotation #${id} not found`);
        return quote;
    }

    async update(id: number, updateDto: UpdateQuotationDto) {
        const quote = await this.prisma.quotation.findUnique({ where: { id } });
        if (quote?.status !== 'DRAFT') throw new BadRequestException('Only DRAFT quotations can be edited');
        return this.prisma.quotation.update({ where: { id }, data: updateDto as any });
    }

    async remove(id: number) {
        const quote = await this.prisma.quotation.findUnique({ where: { id } });
        if (quote?.status !== 'DRAFT' && quote?.status !== 'CANCELLED') {
            throw new BadRequestException('Only DRAFT or CANCELLED quotations can be deleted');
        }
        return this.prisma.quotation.delete({ where: { id } });
    }
}
