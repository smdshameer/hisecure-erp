import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StockLedgerService } from './stock-ledger.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('stock-ledger')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockLedgerController {
    constructor(private readonly service: StockLedgerService) { }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get('product/:id')
    findByProduct(@Param('id') id: string) {
        return this.service.findByProduct(+id);
    }
}
