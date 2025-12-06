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

    // Seed Settings (Advanced Schema)
    const settings = [
        { key: 'COMPANY_NAME', value: 'HiSecure ERP', category: 'SYSTEM', type: 'STRING', description: 'Name of the company' },
        { key: 'THEME_COLOR', value: 'SYSTEM', category: 'SYSTEM', type: 'STRING', description: 'Application theme' },
        { key: 'LOW_STOCK_THRESHOLD', value: '10', category: 'INVENTORY', type: 'NUMBER', description: 'Global low stock warning level' },
        { key: 'ENABLE_BARCODE', value: 'true', category: 'INVENTORY', type: 'BOOLEAN', description: 'Enable barcode scanning' },
        { key: 'DEFAULT_TAX_RATE', value: '18', category: 'SALES', type: 'NUMBER', description: 'Default GST rate (%)' },
        { key: 'INVOICE_PREFIX', value: 'INV-', category: 'SALES', type: 'STRING', description: 'Prefix for invoice numbers' },
        { key: 'ENABLE_LEAD_SCORING', value: 'false', category: 'CRM', type: 'BOOLEAN', description: 'Enable AI lead scoring' },
        { key: 'JOBCARD_PREFIX', value: 'JOB-', category: 'SERVICE', type: 'STRING', description: 'Prefix for job cards' },
        // Developer / Secret Settings
        { key: 'API_SECRET_KEY', value: 'super-secret-key-123', category: 'SYSTEM', type: 'SECRET', isSecret: true, isDeveloper: true, description: 'Internal API Key' },
    ];

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: {
                ...setting,
                version: 1,
            },
        });
    }

    console.log('Settings seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
