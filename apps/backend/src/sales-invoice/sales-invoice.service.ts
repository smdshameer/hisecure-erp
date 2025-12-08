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
            data: updateDto,
        });
    }

    remove(id: number) {
        return this.prisma.salesInvoice.delete({ where: { id } });
    }
}
