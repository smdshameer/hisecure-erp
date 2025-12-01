import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarrantyClaimDto, UpdateWarrantyClaimDto } from './dto/create-warranty.dto';

@Injectable()
export class WarrantyService {
  constructor(private prisma: PrismaService) { }

  async createClaim(createWarrantyDto: CreateWarrantyClaimDto) {
    // 1. Check if SaleItem exists and fetch details
    const saleItem = await this.prisma.saleItem.findUnique({
      where: { id: createWarrantyDto.saleItemId },
      include: {
        sale: true,
        product: true,
      },
    });

    if (!saleItem) {
      throw new NotFoundException('Sale item not found');
    }

    // 2. Check Warranty Expiry
    const purchaseDate = new Date(saleItem.sale.createdAt);
    const warrantyMonths = saleItem.product.warrantyMonths;

    if (warrantyMonths === 0) {
      throw new BadRequestException('This product does not have a warranty.');
    }

    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

    if (new Date() > expiryDate) {
      throw new BadRequestException(`Warranty expired on ${expiryDate.toLocaleDateString()}`);
    }

    // 3. Create Claim
    return this.prisma.warrantyClaim.create({
      data: {
        saleItemId: createWarrantyDto.saleItemId,
        description: createWarrantyDto.description,
        status: 'PENDING',
      },
    });
  }

  findAll() {
    return this.prisma.warrantyClaim.findMany({
      include: {
        saleItem: {
          include: {
            product: true,
            sale: {
              include: {
                customer: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    const claim = await this.prisma.warrantyClaim.findUnique({
      where: { id },
      include: {
        saleItem: {
          include: {
            product: true,
            sale: true
          }
        }
      }
    });
    if (!claim) throw new NotFoundException('Claim not found');
    return claim;
  }

  update(id: number, updateWarrantyDto: UpdateWarrantyClaimDto) {
    return this.prisma.warrantyClaim.update({
      where: { id },
      data: updateWarrantyDto,
    });
  }

  // Helper to check warranty status by Invoice or Serial (using Invoice for now)
  async checkWarrantyByInvoice(invoiceNo: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { invoiceNo },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!sale) throw new NotFoundException('Invoice not found');

    return sale.items.map(item => {
      const purchaseDate = new Date(sale.createdAt);
      const warrantyMonths = item.product.warrantyMonths;
      const expiryDate = new Date(purchaseDate);
      expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

      const isValid = new Date() <= expiryDate;

      return {
        productName: item.product.name,
        sku: item.product.sku,
        warrantyMonths,
        purchaseDate,
        expiryDate,
        isValid,
        saleItemId: item.id
      };
    });
  }
}
