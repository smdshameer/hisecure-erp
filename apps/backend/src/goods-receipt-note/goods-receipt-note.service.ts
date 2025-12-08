import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';

@Injectable()
export class GoodsReceiptNoteService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateGrnDto, userId: number) {
        const { items, ...grnData } = createDto;
        const grnNumber = `GRN-${Date.now()}`;

        return this.prisma.$transaction(async (prisma) => {
            // 1. Prepare Items & Calculate
            const grnItems = [];
            let totalValue = 0;

            for (const item of items) {
                const lineTotal = item.purchasePrice * item.quantity; // + Tax if needed

                // Update Stock (Incoming)
                const stock = await prisma.branchStock.findUnique({
                    where: { branchId_productId: { branchId: grnData.warehouseId, productId: item.productId } }
                });

                if (stock) {
                    await prisma.branchStock.update({
                        where: { id: stock.id },
                        data: { quantity: { increment: item.quantity } }
                    });
                } else {
                    await prisma.branchStock.create({
                        data: {
                            branchId: grnData.warehouseId,
                            productId: item.productId,
                            quantity: item.quantity
                        }
                    });
                }

                grnItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    purchasePrice: item.purchasePrice,
                    lineTotal,
                    description: item.description,
                    unit: item.unit
                });

                totalValue += lineTotal;
            }

            // 2. Create GRN
            const grn = await prisma.goodsReceiptNote.create({
                data: {
                    grnNumber,
                    ...grnData,
                    createdBy: userId,
                    items: { create: grnItems }
                },
            });

            // 3. Ledger Entry
            for (const item of items) {
                const currentStock = await prisma.branchStock.findUnique({
                    where: { branchId_productId: { branchId: grnData.warehouseId, productId: item.productId } }
                });
                if (!currentStock) throw new NotFoundException('Stock record not found during ledger entry');

                await prisma.stockLedger.create({
                    data: {
                        tenantId: 1,
                        qtyIn: item.quantity,
                        qtyOut: 0,
                        balanceQty: currentStock.quantity,
                        refType: 'GRN',
                        refId: grn.id,
                        productId: item.productId,
                        warehouseId: grnData.warehouseId
                    }
                });
            }

            return grn;
        });
    }

    findAll() {
        return this.prisma.goodsReceiptNote.findMany({
            include: {
                supplier: true,
                warehouse: true,
                _count: { select: { items: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    findOne(id: number) {
        return this.prisma.goodsReceiptNote.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                supplier: true,
                warehouse: true,
                creator: true
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(id: number, _updateDto: UpdateGrnDto) {
        return `Update GRN logic here (usually restricted)`;
    }

    remove(id: number) {
        return this.prisma.goodsReceiptNote.delete({ where: { id } });
    }
}
