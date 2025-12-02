import { Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class TransfersService {
  constructor(private prisma: PrismaService) {}
  async create(createTransferDto: CreateTransferDto) {
    const { sourceBranchId, targetBranchId, productId, quantity } =
      createTransferDto;

    return this.prisma.$transaction(async (prisma) => {
      // 1. Validate Product
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) throw new BadRequestException('Product not found');

      // 2. Deduct from Source
      if (sourceBranchId) {
        // Source is a Branch
        const sourceStock = await prisma.branchStock.findUnique({
          where: {
            branchId_productId: { branchId: sourceBranchId, productId },
          },
        });
        if (!sourceStock || sourceStock.quantity < quantity) {
          throw new BadRequestException('Insufficient stock at source branch');
        }
        await prisma.branchStock.update({
          where: {
            branchId_productId: { branchId: sourceBranchId, productId },
          },
          data: { quantity: { decrement: quantity } },
        });
      } else {
        // Source is Main Warehouse
        if (product.stockQuantity < quantity) {
          throw new BadRequestException('Insufficient stock at Main Warehouse');
        }
        await prisma.product.update({
          where: { id: productId },
          data: { stockQuantity: { decrement: quantity } },
        });
      }

      // 3. Add to Target
      if (targetBranchId) {
        // Target is a Branch
        await prisma.branchStock.upsert({
          where: {
            branchId_productId: { branchId: targetBranchId, productId },
          },
          create: { branchId: targetBranchId, productId, quantity },
          update: { quantity: { increment: quantity } },
        });
      } else {
        // Target is Main Warehouse
        await prisma.product.update({
          where: { id: productId },
          data: { stockQuantity: { increment: quantity } },
        });
      }

      // 4. Record Transfer
      return prisma.stockTransfer.create({
        data: {
          sourceBranchId,
          targetBranchId,
          productId,
          quantity,
          status: 'COMPLETED',
        },
      });
    });
  }

  findAll() {
    return this.prisma.stockTransfer.findMany({
      include: { product: true, sourceBranch: true, targetBranch: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.stockTransfer.findUnique({
      where: { id },
      include: { product: true, sourceBranch: true, targetBranch: true },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateTransferDto: UpdateTransferDto) {
    return `This action updates a #${id} transfer`;
  }

  remove(id: number) {
    return `This action removes a #${id} transfer`;
  }
}
