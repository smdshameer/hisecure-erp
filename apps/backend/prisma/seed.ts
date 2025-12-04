import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Manager
    const manager = await prisma.user.upsert({
        where: { email: 'manager@hisecure.com' },
        update: {},
        create: {
            email: 'manager@hisecure.com',
            name: 'Manager',
            password: hashedPassword,
            role: 'STORE_MANAGER',
        },
    });

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@hisecure.com' },
        update: {},
        create: {
            email: 'admin@hisecure.com',
            name: 'Admin User',
            password: await bcrypt.hash('admin123', 10),
            role: 'ADMIN',
        },
    });

    // Create Tech
    const tech = await prisma.user.upsert({
        where: { email: 'tech@hisecure.com' },
        update: {},
        create: {
            email: 'tech@hisecure.com',
            name: 'Technician',
            password: hashedPassword,
            role: 'TECHNICIAN',
        },
    });

    console.log({ manager, tech, admin });

    // Create Products
    const product1 = await prisma.product.upsert({
        where: { sku: 'CCTV-001' },
        update: {},
        create: {
            sku: 'CCTV-001',
            name: 'HD CCTV Camera',
            description: '1080p Night Vision Camera',
            price: 2500.00,
            costPrice: 1500.00,
            stockQuantity: 50,
            category: 'Security',
        },
    });

    const product2 = await prisma.product.upsert({
        where: { sku: 'DVR-004' },
        update: {},
        create: {
            sku: 'DVR-004',
            name: '4 Channel DVR',
            description: 'Supports 4 Cameras',
            price: 4500.00,
            costPrice: 3000.00,
            stockQuantity: 20,
            category: 'Security',
        },
    });

    // Create a Sale
    const sale = await prisma.sale.create({
        data: {
            invoiceNo: `INV-${Date.now()}`,
            totalAmount: 7000.00,
            paymentMethod: 'CASH',
            userId: admin.id,
            items: {
                create: [
                    { productId: product1.id, quantity: 1, price: 2500.00 },
                    { productId: product2.id, quantity: 1, price: 4500.00 },
                ],
            },
        },
    });

    console.log({ product1, product2, sale });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
