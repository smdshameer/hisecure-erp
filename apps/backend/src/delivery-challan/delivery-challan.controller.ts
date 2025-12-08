import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { DeliveryChallanService } from './delivery-challan.service';
import { CreateDeliveryChallanDto } from './dto/create-delivery-challan.dto';
import { UpdateDeliveryChallanDto } from './dto/update-delivery-challan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('delivery-challans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryChallanController {
    constructor(private readonly dcService: DeliveryChallanService) { }

    @Post()
    create(@Body() createDto: CreateDeliveryChallanDto, @Req() req: any) {
        return this.dcService.create(createDto, req.user.id);
    }

    @Get()
    findAll(
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('customerId') customerId?: string,
        @Query('status') status?: string,
        @Query('type') type?: string,
        @Query('warehouseId') warehouseId?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        return this.dcService.findAll({
            dateFrom,
            dateTo,
            customerId: customerId ? Number(customerId) : undefined,
            status,
            type,
            warehouseId: warehouseId ? Number(warehouseId) : undefined,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 50,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.dcService.findOne(+id);
    }

    @Get(':id/print')
    getPrintData(@Param('id') id: string) {
        return this.dcService.getPrintData(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateDeliveryChallanDto) {
        return this.dcService.update(+id, updateDto);
    }

    @Post(':id/dispatch')
    dispatch(@Param('id') id: string, @Req() req: any) {
        return this.dcService.dispatch(+id, req.user.id);
    }

    @Post(':id/cancel')
    cancel(@Param('id') id: string, @Req() req: any) {
        return this.dcService.cancel(+id, req.user.id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.dcService.remove(+id);
    }
}
