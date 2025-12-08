import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GoodsReceiptNoteService } from './goods-receipt-note.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('grn')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoodsReceiptNoteController {
    constructor(private readonly grnService: GoodsReceiptNoteService) { }

    @Post()
    create(@Body() createDto: CreateGrnDto, @Req() req) {
        return this.grnService.create(createDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.grnService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.grnService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateGrnDto) {
        return this.grnService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.grnService.remove(+id);
    }
}
