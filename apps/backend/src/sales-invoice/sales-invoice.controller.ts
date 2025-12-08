import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SalesInvoiceService } from './sales-invoice.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from './dto/update-sales-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('sales-invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesInvoiceController {
    constructor(private readonly invoiceService: SalesInvoiceService) { }

    @Post()
    create(@Body() createDto: CreateSalesInvoiceDto, @Req() req: any) {
        return this.invoiceService.create(createDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.invoiceService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoiceService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateSalesInvoiceDto) {
        return this.invoiceService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.invoiceService.remove(+id);
    }
}
