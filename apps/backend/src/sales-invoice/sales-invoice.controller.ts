import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
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

    @Post('from-delivery-challans')
    createFromDCs(@Body('deliveryChallanIds') ids: number[], @Req() req: any) {
        return this.invoiceService.createFromChallans(ids, req.user.id);
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
        return this.invoiceService.findAll({
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
        return this.invoiceService.findOne(+id);
    }

    @Get(':id/print')
    getPrintData(@Param('id') id: string) {
        return this.invoiceService.getPrintData(+id);
    }

    @Post(':id/post')
    post(@Param('id') id: string, @Req() req: any) {
        return this.invoiceService.post(+id, req.user.id);
    }

    @Post(':id/cancel')
    cancel(@Param('id') id: string, @Req() req: any) {
        return this.invoiceService.cancel(+id, req.user.id);
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
