import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GstReportsService } from './gst-reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ReportsController],
    providers: [ReportsService, GstReportsService],
})
export class ReportsModule { }
