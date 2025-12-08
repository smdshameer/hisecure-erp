import { Module } from '@nestjs/common';
import { StockLedgerService } from './stock-ledger.service';
import { StockLedgerController } from './stock-ledger.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [StockLedgerController],
    providers: [StockLedgerService],
    exports: [StockLedgerService],
})
export class StockLedgerModule { }
