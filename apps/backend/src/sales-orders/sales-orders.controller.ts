import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('sales-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesOrdersController {
    constructor(private readonly ordersService: SalesOrdersService) { }

    @Post()
    create(@Body() createDto: CreateSalesOrderDto, @Req() req: any) {
        return this.ordersService.create(createDto, req.user.id);
    }

    @Get()
    findAll(
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('customerId') customerId?: string,
        @Query('status') status?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
    ) {
        return this.ordersService.findAll({
            dateFrom,
            dateTo,
            customerId: customerId ? Number(customerId) : undefined,
            status,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 50,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(+id);
    }

    @Post(':id/confirm')
    confirm(@Param('id') id: string, @Req() req: any) {
        return this.ordersService.confirm(+id, req.user.id);
    }

    @Post(':id/cancel')
    cancel(@Param('id') id: string, @Req() req: any) {
        return this.ordersService.cancel(+id, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateSalesOrderDto) {
        return this.ordersService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ordersService.remove(+id);
    }
}
