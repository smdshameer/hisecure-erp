import { Module } from '@nestjs/common';
import { GoodsReceiptNoteService } from './goods-receipt-note.service';
import { GoodsReceiptNoteController } from './goods-receipt-note.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [PrismaModule, SettingsModule],
    controllers: [GoodsReceiptNoteController],
    providers: [GoodsReceiptNoteService],
    exports: [GoodsReceiptNoteService],
})
export class GoodsReceiptNoteModule { }
