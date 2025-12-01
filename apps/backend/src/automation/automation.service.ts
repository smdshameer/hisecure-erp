import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AutomationService {
    private readonly logger = new Logger(AutomationService.name);

    constructor(
        private readonly mailService: MailService,
        private readonly prisma: PrismaService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_8PM)
    async handleDailyReport() {
        this.logger.log('Generating daily sales report...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sales = await this.prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: { items: true },
        });

        const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        const totalOrders = sales.length;

        // In a real app, we would fetch the manager's email dynamically
        // For now, we use a hardcoded email or environment variable
        const managerEmail = 'manager@hisecure.com';

        await this.mailService.sendDailyReport(managerEmail, {
            date: today.toLocaleDateString(),
            totalSales,
            totalOrders,
        });

        this.logger.log(`Daily report sent to ${managerEmail}`);
    }
}
