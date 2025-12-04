import { Injectable } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotationsService {
    constructor(private prisma: PrismaService) { }

    async create(createQuotationDto: CreateQuotationDto) {
        const { items, ...quotationData } = createQuotationDto;

        // Calculate totals
        let subTotal = 0;
        items.forEach(item => {
            subTotal += item.quantity * item.unitPrice;
        });

        // Simple tax calculation (can be enhanced)
        const cgst = subTotal * 0.09;
        const sgst = subTotal * 0.09;
        const totalAmount = subTotal + cgst + sgst;

        return this.prisma.quotation.create({
            data: {
                ...quotationData,
                quotationNo: `QTN-${Date.now()}`,
                subTotal,
                cgst,
                sgst,
                totalAmount,
                items: {
                    create: items,
                },
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                customer: true
            }
        });
    }

    findAll() {
        return this.prisma.quotation.findMany({
            include: {
                customer: true,
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    findOne(id: number) {
        return this.prisma.quotation.findUnique({
            where: { id },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    update(id: number, updateQuotationDto: UpdateQuotationDto) {
        // For now, only allowing status updates or simple field updates
        // Complex item updates would require more logic
        const { items, ...data } = updateQuotationDto;
        return this.prisma.quotation.update({
            where: { id },
            data: data,
        });
    }

    remove(id: number) {
        return this.prisma.quotation.delete({
            where: { id },
        });
    }
}
