import { PrismaClient, Role } from '@prisma/client';
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
            role: Role.STORE_MANAGER,
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
            role: Role.ADMIN,
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
            role: Role.TECHNICIAN,
        },
    });

    console.log({ manager, tech });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
