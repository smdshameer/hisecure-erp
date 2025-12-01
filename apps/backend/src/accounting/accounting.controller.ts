import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import * as express from 'express';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) { }

  @Get('sales')
  async exportSales(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: express.Response,
  ) {
    const csv = await this.accountingService.exportSales(startDate, endDate);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales-${startDate}-to-${endDate}.csv`);
    res.send(csv);
  }

  @Get('purchases')
  async exportPurchases(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: express.Response,
  ) {
    const csv = await this.accountingService.exportPurchases(startDate, endDate);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=purchases-${startDate}-to-${endDate}.csv`);
    res.send(csv);
  }
}
