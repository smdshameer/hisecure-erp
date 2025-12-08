import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryChallanDto } from './dto/create-delivery-challan.dto';
import { UpdateDeliveryChallanDto } from './dto/update-delivery-challan.dto';

@Injectable()
export class DeliveryChallanService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateDeliveryChallanDto, userId: number) {
        const { items, ...challanData } = createDto;

        // Generate Challan Number
        const challanNumber = `DC-${Date.now()}`;

        return this.prisma.$transaction(async (prisma) => {
            // 1. Verify FROM Warehouse (Branch)
            const fromBranch = await prisma.branch.findUnique({
                where: { id: challanData.fromWarehouseId },
            });
            if (!fromBranch) throw new NotFoundException('Source Warehouse not found');

            // 2. Prepare Items & Check/Deduct Stock
            const dcItems = [];
            const stockLedgerEntries = [];

            for (const item of items) {
                // Stock Check
                const stock = await prisma.branchStock.findUnique({
                    where: {
                        branchId_productId: {
                            branchId: challanData.fromWarehouseId,
                            productId: item.productId,
                        },
                    },
                });

                if (!stock || stock.quantity < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for Product ID ${item.productId}`);
                }

                // Deduct Stock
                await prisma.branchStock.update({
                    where: { id: stock.id },
                    data: { quantity: { decrement: item.quantity } },
                });

                // Add to DC Items
                dcItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unit: item.unit,
                    description: item.description,
                    serialNumbers: item.serialNumbers, // Optional
                });

                // Prepare Ledger Entry
                // We'll create the ledger entry after the DC is created to get the REF ID,
                // but we can prepare data. 
                // actually we need to create DC first.
            }

            // 3. Create Delivery Challan
            const newDC = await prisma.deliveryChallan.create({
                data: {
                    challanNumber,
                    ...challanData,
                    createdBy: userId,
                    items: {
                        create: dcItems,
                    },
                },
            });

            // 4. Create Stock Ledger Entries
            for (const item of items) {
                // Get current balance after deduction (approximate for ledger record)
                const currentStock = await prisma.branchStock.findUnique({
                    where: { branchId_productId: { branchId: challanData.fromWarehouseId, productId: item.productId } }
                });

                await prisma.stockLedger.create({
                    data: {
                        tenantId: 1,
                        qtyIn: 0,
                        qtyOut: item.quantity,
                        balanceQty: currentStock.quantity,
                        refType: 'DELIVERY_CHALLAN',
                        refId: newDC.id,
                        productId: item.productId,
                        warehouseId: challanData.fromWarehouseId,
                    }
                });
            }

            return newDC;
        });
    }

    findAll() {
        return this.prisma.deliveryChallan.findMany({
            include: {
                customer: true,
                fromWarehouse: true,
                toWarehouse: true,
                _count: { select: { items: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const dc = await this.prisma.deliveryChallan.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                customer: true,
                fromWarehouse: true,
                toWarehouse: true,
                creator: { select: { id: true, name: true } },
            },
        });
        if (!dc) throw new NotFoundException(`Delivery Challan #${id} not found`);
        return dc;
    }

    update(id: number, updateDto: UpdateDeliveryChallanDto) {
        return this.prisma.deliveryChallan.update({
            where: { id },
            data: updateDto,
        });
    }

    remove(id: number) {
        return this.prisma.deliveryChallan.delete({ where: { id } });
    }
}
