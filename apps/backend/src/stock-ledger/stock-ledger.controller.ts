import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StockLedgerService } from './stock-ledger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('stock-ledger')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockLedgerController {
    constructor(private readonly stockLedgerService: StockLedgerService) { }

    @Get()
    findAll(
        @Query('productId') productId?: string,
        @Query('warehouseId') warehouseId?: string,
        @Query('refType') refType?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        return this.stockLedgerService.findAll({
            productId: productId ? Number(productId) : undefined,
            warehouseId: warehouseId ? Number(warehouseId) : undefined,
            refType,
            dateFrom,
            dateTo,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 100,
        });
    }

    @Get('product/:id')
    findByProduct(
        @Param('id') id: string,
        @Query('warehouseId') warehouseId?: string
    ) {
        return this.stockLedgerService.findByProduct(+id, warehouseId ? Number(warehouseId) : undefined);
    }

    @Get('product/:id/summary')
    getStockSummary(@Param('id') id: string) {
        return this.stockLedgerService.getStockSummary(+id);
    }
}
