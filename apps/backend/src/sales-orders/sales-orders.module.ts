import { Module } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [PrismaModule, SettingsModule],
    controllers: [SalesOrdersController],
    providers: [SalesOrdersService],
    exports: [SalesOrdersService],
})
export class SalesOrdersModule { }
