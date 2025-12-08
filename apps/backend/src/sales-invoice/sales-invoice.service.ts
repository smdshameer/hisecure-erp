import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from './dto/update-sales-invoice.dto';

@Injectable()
export class SalesInvoiceService {
    constructor(
        private prisma: PrismaService,
        private settings: SettingsService
    ) { }

    private async generateInvoiceNumber(tenantId: number): Promise<string> {
        const prefix = await this.settings.getValue<string>('docSeries.salesInvoice.prefix') || 'INV-';
        const padding = await this.settings.getValue<number>('docSeries.salesInvoice.padding') || 4;
        const count = await this.prisma.salesInvoice.count({ where: { tenantId } });
        return `${prefix}${(count + 1).toString().padStart(padding, '0')}`;
    }

    async create(createDto: CreateSalesInvoiceDto, userId: number, tenantId: number = 1) {
        const { items, deliveryChallanIds, ...invoiceData } = createDto;

        const invoiceNumber = await this.generateInvoiceNumber(tenantId);

        return this.prisma.$transaction(async (prisma) => {
            let totalBeforeTax = 0;
            let totalTax = 0;
            const invoiceItems = [];

            for (const item of items) {
                const lineTotal = item.price * item.quantity;
                const taxAmount = (lineTotal * (item.taxRate || 0)) / 100;
                totalBeforeTax += lineTotal;
                totalTax += taxAmount;

                invoiceItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    taxRate: item.taxRate,
                    lineTotal: lineTotal,
                    description: item.description,
                });
            }

            const totalAmount = totalBeforeTax + totalTax;

            const invoice = await prisma.salesInvoice.create({
                data: {
                    tenantId,
                    invoiceNumber,
                    ...invoiceData,
                    totalBeforeTax,
                    totalTax,
                    totalAmount,
                    createdBy: userId,
                    items: { create: invoiceItems },
                },
            });

            if (deliveryChallanIds && deliveryChallanIds.length > 0) {
                await prisma.salesInvoiceDeliveryChallan.createMany({
                    data: deliveryChallanIds.map(dcId => ({
                        salesInvoiceId: invoice.id,
                        deliveryChallanId: dcId
                    }))
                });
                await prisma.deliveryChallan.updateMany({
                    where: { id: { in: deliveryChallanIds } },
                    data: { status: 'INVOICED' }
                });
            }

            return invoice;
        });
    }

    async createFromChallans(dcIds: number[], userId: number) {
        if (!dcIds || dcIds.length === 0) throw new NotFoundException('No Delivery Challan IDs provided');

        return this.prisma.$transaction(async (prisma) => {
            const dcs = await prisma.deliveryChallan.findMany({
                where: { id: { in: dcIds } },
                include: { items: { include: { product: true } }, customer: true }
            });

            if (dcs.length !== dcIds.length) throw new NotFoundException('One or more Challans not found');

            const customerId = dcs[0].customerId;
            const tenantId = dcs[0].tenantId;

            if (dcs.some(dc => dc.customerId !== customerId)) {
                throw new BadRequestException('All Challans must belong to the same Customer');
            }
            if (dcs.some(dc => dc.status !== 'DISPATCHED')) {
                throw new BadRequestException('All Challans must be in DISPATCHED status');
            }

            const invoiceItems = [];
            let totalBeforeTax = 0;
            let totalTax = 0;

            for (const dc of dcs) {
                for (const item of dc.items) {
                    const price = Number(item.product.price);
                    const quantity = item.quantity;
                    const taxRate = Number(item.product.gstRate || 0);
                    const lineTotal = price * quantity;
                    const taxAmount = (lineTotal * taxRate) / 100;

                    totalBeforeTax += lineTotal;
                    totalTax += taxAmount;

                    invoiceItems.push({
                        productId: item.productId,
                        quantity,
                        price,
                        taxRate,
                        lineTotal,
                        description: item.description || item.product.name,
                    });
                }
            }

            const totalAmount = totalBeforeTax + totalTax;
            const invoiceNumber = await this.generateInvoiceNumber(tenantId);

            const invoice = await prisma.salesInvoice.create({
                data: {
                    tenantId,
                    invoiceNumber,
                    invoiceDate: new Date(),
                    customerId: customerId!,
                    status: 'DRAFT',
                    totalBeforeTax,
                    totalTax,
                    totalAmount,
                    createdBy: userId,
                    items: { create: invoiceItems },
                },
            });

            await prisma.salesInvoiceDeliveryChallan.createMany({
                data: dcIds.map(dcId => ({ salesInvoiceId: invoice.id, deliveryChallanId: dcId }))
            });

            await prisma.deliveryChallan.updateMany({
                where: { id: { in: dcIds } },
                data: { status: 'INVOICED' }
            });

            return invoice;
        });
    }

    async post(id: number, userId: number) {
        const invoice = await this.prisma.salesInvoice.findUnique({ where: { id } });
        if (!invoice) throw new NotFoundException(`Invoice #${id} not found`);
        if (invoice.status !== 'DRAFT') throw new BadRequestException('Only DRAFT invoices can be posted');

        return this.prisma.salesInvoice.update({
            where: { id },
            data: { status: 'POSTED' }
        });
    }

    async cancel(id: number, userId: number) {
        const invoice = await this.prisma.salesInvoice.findUnique({ where: { id } });
        if (!invoice) throw new NotFoundException(`Invoice #${id} not found`);
        if (invoice.status === 'CANCELLED') throw new BadRequestException('Already cancelled');

        return this.prisma.salesInvoice.update({
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
            where.invoiceDate = {};
            if (filters.dateFrom) where.invoiceDate.gte = new Date(filters.dateFrom);
            if (filters.dateTo) where.invoiceDate.lte = new Date(filters.dateTo);
        }

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 50;

        const [data, total] = await Promise.all([
            this.prisma.salesInvoice.findMany({
                where,
                include: { customer: true, creator: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.salesInvoice.count({ where })
        ]);

        return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    async findOne(id: number) {
        const invoice = await this.prisma.salesInvoice.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                customer: true,
                challanLinks: { include: { deliveryChallan: true } },
            }
        });
        if (!invoice) throw new NotFoundException(`Invoice #${id} not found`);
        return invoice;
    }

    async getPrintData(id: number) {
        const invoice = await this.findOne(id);
        const companyName = await this.settings.getValue<string>('company.name') || 'HiSecure ERP';
        return { ...invoice, companyName };
    }

    update(id: number, updateDto: UpdateSalesInvoiceDto) {
        return this.prisma.salesInvoice.update({ where: { id }, data: updateDto as any });
    }

    remove(id: number) {
        return this.prisma.salesInvoice.delete({ where: { id } });
    }
}
