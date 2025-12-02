/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
    const { supplierId, items } = createPurchaseOrderDto;

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitCost * item.quantity,
      0,
    );
    const poNumber = `PO-${Date.now()}`;

    return this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        totalAmount,
        supplierId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: { items: true },
    });
  }

  findAll() {
    return this.prisma.purchaseOrder.findMany({ include: { supplier: true } });
  }

  findOne(id: number) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { product: true } } },
    });
  }

  update(id: number, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: updatePurchaseOrderDto as any,
    });
  }

  async markAsReceived(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!po) throw new BadRequestException('PO not found');
      if (po.status === 'RECEIVED')
        throw new BadRequestException('PO already received');

      // Update Stock
      for (const item of po.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }

      // Update PO Status
      return prisma.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
      });
    });
  }

  remove(id: number) {
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }
}
