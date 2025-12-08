import { Module } from '@nestjs/common';
import { GoodsReceiptNoteService } from './goods-receipt-note.service';
import { GoodsReceiptNoteController } from './goods-receipt-note.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [GoodsReceiptNoteController],
    providers: [GoodsReceiptNoteService],
    exports: [GoodsReceiptNoteService],
})
export class GoodsReceiptNoteModule { }
