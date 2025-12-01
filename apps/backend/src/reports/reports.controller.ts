import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GstReportsService } from './gst-reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly gstReportsService: GstReportsService,
    ) { }

    @Get('stats')
    getDashboardStats() {
        return this.reportsService.getDashboardStats();
    }

    @Get('low-stock')
    getLowStock() {
        return this.reportsService.getLowStockProducts();
    }

    @Get('recent-sales')
    getRecentSales() {
        return this.reportsService.getRecentSales();
    }

    @Get('gst/gstr1')
    getGstr1(@Query('month') month: string, @Query('year') year: string) {
        return this.gstReportsService.getGstr1(Number(month), Number(year));
    }

    @Get('gst/gstr3b')
    getGstr3b(@Query('month') month: string, @Query('year') year: string) {
        return this.gstReportsService.getGstr3b(Number(month), Number(year));
    }
}
