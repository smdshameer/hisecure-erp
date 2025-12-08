import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('sales-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesOrdersController {
    constructor(private readonly salesOrdersService: SalesOrdersService) { }

    @Post()
    create(@Body() createSalesOrderDto: CreateSalesOrderDto, @Req() req: any) {
        return this.salesOrdersService.create(createSalesOrderDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.salesOrdersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesOrdersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSalesOrderDto: UpdateSalesOrderDto) {
        return this.salesOrdersService.update(+id, updateSalesOrderDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.salesOrdersService.remove(+id);
    }
}
