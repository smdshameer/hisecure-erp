import { Module } from '@nestjs/common';
import { DeliveryChallanService } from './delivery-challan.service';
import { DeliveryChallanController } from './delivery-challan.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DeliveryChallanController],
    providers: [DeliveryChallanService],
    exports: [DeliveryChallanService],
})
export class DeliveryChallanModule { }
