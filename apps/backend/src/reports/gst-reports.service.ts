import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GstReportsService {
    constructor(private prisma: PrismaService) { }

    async getGstr1(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const sales = await this.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                customer: true,
                items: true,
            },
        });

        // Transform to GSTR-1 format (B2B, B2C, etc.)
        return sales.map(sale => ({
            invoiceNo: sale.invoiceNo,
            date: sale.createdAt,
            customerName: sale.customer?.name || 'Walk-in',
            customerGstin: sale.customer?.gstin || 'N/A',
            taxableValue: sale.subTotal,
            cgst: sale.cgst,
            sgst: sale.sgst,
            igst: sale.igst,
            totalAmount: sale.totalAmount,
            placeOfSupply: sale.customer?.state || 'Local',
        }));
    }

    async getGstr3b(month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // 1. Outward Supplies (Sales)
        const sales = await this.prisma.sale.aggregate({
            where: {
                createdAt: { gte: startDate, lte: endDate },
            },
            _sum: {
                subTotal: true,
                cgst: true,
                sgst: true,
                igst: true,
                totalAmount: true,
            },
        });

        // 2. Inward Supplies (Purchases) - Input Tax Credit
        const purchases = await this.prisma.purchaseOrder.aggregate({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: 'RECEIVED', // Only count received orders
            },
            _sum: {
                subTotal: true,
                cgst: true,
                sgst: true,
                igst: true,
                totalAmount: true,
            },
        });

        return {
            outwardSupplies: {
                taxableValue: Number(sales._sum.subTotal) || 0,
                cgst: Number(sales._sum.cgst) || 0,
                sgst: Number(sales._sum.sgst) || 0,
                igst: Number(sales._sum.igst) || 0,
                totalTax: (Number(sales._sum.cgst) || 0) + (Number(sales._sum.sgst) || 0) + (Number(sales._sum.igst) || 0),
            },
            itcAvailable: { // Input Tax Credit
                taxableValue: Number(purchases._sum.subTotal) || 0,
                cgst: Number(purchases._sum.cgst) || 0,
                sgst: Number(purchases._sum.sgst) || 0,
                igst: Number(purchases._sum.igst) || 0,
                totalTax: (Number(purchases._sum.cgst) || 0) + (Number(purchases._sum.sgst) || 0) + (Number(purchases._sum.igst) || 0),
            },
            taxPayable: {
                cgst: Math.max(0, (Number(sales._sum.cgst) || 0) - (Number(purchases._sum.cgst) || 0)),
                sgst: Math.max(0, (Number(sales._sum.sgst) || 0) - (Number(purchases._sum.sgst) || 0)),
                igst: Math.max(0, (Number(sales._sum.igst) || 0) - (Number(purchases._sum.igst) || 0)),
            }
        };
    }
}
