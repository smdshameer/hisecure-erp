import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesOrdersService {
    constructor(private prisma: PrismaService) { }

    async create(createSalesOrderDto: CreateSalesOrderDto, userId: number) {
        const { items, customerId, ...orderData } = createSalesOrderDto;

        // Generate Order Number
        const orderNumber = `SO-${Date.now()}`; // Simple generation, can be improved

        // Transaction to ensure integrity
        return this.prisma.$transaction(async (prisma) => {
            // 1. Verify Customer
            const customer = await prisma.customer.findUnique({
                where: { id: customerId },
            });
            if (!customer) {
                throw new NotFoundException(`Customer with ID ${customerId} not found`);
            }

            // 2. Prepare Items
            const orderItems = [];
            let totalAmount = 0; // If calculating backend side, or validate frontend calculation

            for (const item of items) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new NotFoundException(`Product ID ${item.productId} not found`);
                }

                // Optional: specific pricing logic or discounts here
                // We assume DTO provides price/discount/tax for flexibility in this MVP

                orderItems.push({
                    productId: item.productId,
                    orderedQty: item.quantity,
                    dispatchedQty: 0,
                    unit: item.unit || 'pcs',
                    price: item.price,
                    discount: item.discount || 0,
                    taxRate: item.taxRate || 0,
                    lineTotal: item.lineTotal,
                    description: item.description,
                });
            }

            // 3. Create Sales Order
            const salesOrder = await prisma.salesOrder.create({
                data: {
                    orderNumber,
                    ...orderData, // status, remarks, quotationId
                    customerId,
                    createdBy: userId,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    items: true,
                    customer: true,
                },
            });

            return salesOrder;
        });
    }

    findAll() {
        return this.prisma.salesOrder.findMany({
            include: {
                customer: true,
                creator: { select: { id: true, name: true } },
                _count: { select: { items: true, deliveryChallans: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const order = await this.prisma.salesOrder.findUnique({
            where: { id },
            include: {
                customer: true,
                items: {
                    include: { product: true },
                },
                quotation: true,
                deliveryChallans: true,
                creator: { select: { id: true, name: true } },
            },
        });

        if (!order) {
            throw new NotFoundException(`Sales Order #${id} not found`);
        }

        return order;
    }

    async update(id: number, updateSalesOrderDto: UpdateSalesOrderDto) {
        // Basic update logic - usually restricted if status is CONFIRMED
        return this.prisma.salesOrder.update({
            where: { id },
            data: updateSalesOrderDto as any,
        });
    }

    async remove(id: number) {
        return this.prisma.salesOrder.delete({
            where: { id },
        });
    }
}
