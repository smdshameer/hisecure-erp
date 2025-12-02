import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createSaleDto: CreateSaleDto, userId: number) {
    const { items, ...saleData } = createSaleDto;

    const invoiceNo = `INV-${Date.now()}`;

    const sale = await this.prisma.$transaction(async (prisma) => {
      let subTotal = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      const totalIgst = 0;

      // Prepare items with current product data (price, gst)
      const saleItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }
        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for Product ${product.name}`,
          );
        }

        // Use product price from DB to ensure accuracy, or trust DTO if dynamic pricing allowed.
        // Here we trust DTO price but use DB GST rate.
        const price = Number(item.price);
        const quantity = item.quantity;
        const gstRate = Number(product.gstRate) || 0;

        const lineTotal = price * quantity;
        const taxAmount = (lineTotal * gstRate) / 100;

        // Default to Intra-state (CGST + SGST) for POS
        const cgst = taxAmount / 2;
        const sgst = taxAmount / 2;

        subTotal += lineTotal;
        totalCgst += cgst;
        totalSgst += sgst;

        saleItems.push({
          productId: item.productId,
          quantity: quantity,
          price: price,
        });

        // Deduct Stock
        const updatedProduct = await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: quantity } },
        });

        // Check Low Stock
        if (updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold) {
          // Send alert asynchronously (don't await to avoid blocking transaction)
          this.mailService
            .sendLowStockAlert(
              'manager@hisecure.com',
              updatedProduct.name,
              updatedProduct.stockQuantity,
            )
            .catch(console.error);
        }
      }

      const totalAmount = subTotal + totalCgst + totalSgst + totalIgst;

      // Create Sale
      const newSale = await prisma.sale.create({
        data: {
          ...saleData,
          invoiceNo,
          subTotal,
          cgst: totalCgst,
          sgst: totalSgst,
          igst: totalIgst,
          totalAmount,
          userId,
          items: {
            create: saleItems,
          },
        },
        include: { items: true },
      });

      return newSale;
    });

    // Send Invoice Email (outside transaction)
    // In a real app, we would fetch the customer email or use the logged-in user's email
    // For now, we send to a test email or the manager
    this.mailService
      .sendInvoice(
        'customer@example.com',
        sale.invoiceNo,
        Number(sale.totalAmount),
      )
      .catch(console.error);

    return sale;
  }

  findAll() {
    return this.prisma.sale.findMany({ include: { items: true, user: true } });
  }

  findOne(id: number) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }

  remove(id: number) {
    return `This action removes a #${id} sale`;
  }
}
