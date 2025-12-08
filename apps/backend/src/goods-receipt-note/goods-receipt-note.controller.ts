import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { GoodsReceiptNoteService } from './goods-receipt-note.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('grn')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoodsReceiptNoteController {
    constructor(private readonly grnService: GoodsReceiptNoteService) { }

    @Post()
    create(@Body() createDto: CreateGrnDto, @Req() req: any) {
        return this.grnService.create(createDto, req.user.id);
    }

    @Get()
    findAll(
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('supplierId') supplierId?: string,
        @Query('warehouseId') warehouseId?: string,
        @Query('status') status?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        return this.grnService.findAll({
            dateFrom,
            dateTo,
            supplierId: supplierId ? Number(supplierId) : undefined,
            warehouseId: warehouseId ? Number(warehouseId) : undefined,
            status,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 50,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.grnService.findOne(+id);
    }

    @Post(':id/post')
    post(@Param('id') id: string, @Req() req: any) {
        return this.grnService.post(+id, req.user.id);
    }

    @Post(':id/cancel')
    cancel(@Param('id') id: string, @Req() req: any) {
        return this.grnService.cancel(+id, req.user.id);
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
