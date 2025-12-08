import { Module } from '@nestjs/common';
import { SalesInvoiceService } from './sales-invoice.service';
import { SalesInvoiceController } from './sales-invoice.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [PrismaModule, SettingsModule],
    controllers: [SalesInvoiceController],
    providers: [SalesInvoiceService],
    exports: [SalesInvoiceService],
})
export class SalesInvoiceModule { }
