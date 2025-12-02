import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkStockAndReorder() {
    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        stockQuantity: {
          lte: this.prisma.product.fields.lowStockThreshold
        },
        autoReorder: true
      }
    });

    if (lowStockProducts.length === 0) return;

    // Group by default supplier (assuming ID 1 for MVP or we could add supplierId to Product)
    // For now, we'll create one Draft PO for Supplier 1 containing all items
    const defaultSupplierId = 1;
    const supplierExists = await this.prisma.supplier.findUnique({ where: { id: defaultSupplierId } });

    if (!supplierExists) {
      console.warn('Automated Reordering: Default Supplier (ID 1) not found. Skipping PO creation.');
      return;
    }

    const poItems = lowStockProducts.map(product => ({
      productId: product.id,
      quantity: product.reorderQuantity,
      unitCost: product.costPrice
    }));

    const totalAmount = poItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitCost)), 0);

    await this.prisma.purchaseOrder.create({
      data: {
        poNumber: `AUTO-PO-${Date.now()}`,
        status: 'DRAFT',
        supplierId: defaultSupplierId,
        totalAmount: totalAmount,
        items: {
          create: poItems
        }
      }
    });

    console.log(`Automated Reordering: Created Draft PO for ${lowStockProducts.length} items.`);
  }
}
