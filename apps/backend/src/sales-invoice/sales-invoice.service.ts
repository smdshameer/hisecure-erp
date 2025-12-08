import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from './dto/update-sales-invoice.dto';

@Injectable()
export class SalesInvoiceService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateSalesInvoiceDto, userId: number) {
        const { items, deliveryChallanIds, ...invoiceData } = createDto;

        const invoiceNumber = `INV-${Date.now()}`;

        return this.prisma.$transaction(async (prisma) => {
            // 1. Calculations
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
                    lineTotal: lineTotal, // Assuming FE sends or we calc here. Better to recalc.
                    description: item.description,
                });
            }

            const totalAmount = totalBeforeTax + totalTax;

            // 2. Create Invoice
            const invoice = await prisma.salesInvoice.create({
                data: {
                    invoiceNumber,
                    ...invoiceData,
                    totalBeforeTax,
                    totalTax,
                    totalAmount,
                    createdBy: userId,
                    items: { create: invoiceItems },
                },
            });

            // 3. Link Challans if provided
            if (deliveryChallanIds && deliveryChallanIds.length > 0) {
                await prisma.salesInvoiceDeliveryChallan.createMany({
                    data: deliveryChallanIds.map(dcId => ({
                        salesInvoiceId: invoice.id,
                        deliveryChallanId: dcId
                    }))
                });

                // Update DC status to INVOICED
                await prisma.deliveryChallan.updateMany({
                    where: { id: { in: deliveryChallanIds } },
                    data: { status: 'INVOICED' }
                });
            }

            return invoice;
        });
    }

    findAll() {
        return this.prisma.salesInvoice.findMany({
            include: {
                customer: true,
                creator: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: number) {
        return this.prisma.salesInvoice.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                customer: true,
                challanLinks: { include: { deliveryChallan: true } },
            }
        });
    }

    update(id: number, updateDto: UpdateSalesInvoiceDto) {
        return this.prisma.salesInvoice.update({
            where: { id },
            data: updateDto as any,
        });
    }

    remove(id: number) {
        return this.prisma.salesInvoice.delete({ where: { id } });
    }
    async createFromChallans(dcIds: number[], userId: number) {
        if (!dcIds || dcIds.length === 0) throw new NotFoundException('No Delivery Challan IDs provided');

        return this.prisma.$transaction(async (prisma) => {
            // 1. Fetch DCs with items and products
            const dcs = await prisma.deliveryChallan.findMany({
                where: { id: { in: dcIds } },
                include: { items: { include: { product: true } }, customer: true }
            });

            if (dcs.length !== dcIds.length) throw new NotFoundException('One or more Challans not found');

            // 2. Validate Consistency (Same Customer, Same Tenant)
            const customerId = dcs[0].customerId;
            const tenantId = dcs[0].tenantId;

            if (dcs.some(dc => dc.customerId !== customerId)) {
                throw new Error('All Challans must belong to the same Customer');
            }
            if (dcs.some(dc => dc.status !== 'DISPATCHED')) {
                throw new Error('All Challans must be in DISPATCHED status');
            }

            // 3. Aggregate Items
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
                        quantity: quantity,
                        price: price, // Use current product price
                        taxRate: taxRate,
                        lineTotal: lineTotal,
                        description: item.description || item.product.name,
                    });
                }
            }

            const totalAmount = totalBeforeTax + totalTax;
            const invoiceNumber = `INV-${Date.now()}`;

            // 4. Create Invoice
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

            // 5. Link Challans
            await prisma.salesInvoiceDeliveryChallan.createMany({
                data: dcIds.map(dcId => ({
                    salesInvoiceId: invoice.id,
                    deliveryChallanId: dcId
                }))
            });

            // 6. Update DC Status
            await prisma.deliveryChallan.updateMany({
                where: { id: { in: dcIds } },
                data: { status: 'INVOICED' }
            });

            return invoice;
        });
    }
}
