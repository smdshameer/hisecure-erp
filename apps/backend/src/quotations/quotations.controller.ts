import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationsController {
    constructor(private readonly quotationsService: QuotationsService) { }

    @Post()
    create(@Body() createDto: CreateQuotationDto, @Req() req: any) {
        return this.quotationsService.create(createDto, req.user.id);
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
        return this.quotationsService.findAll({
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
        return this.quotationsService.findOne(+id);
    }

    @Post(':id/send')
    send(@Param('id') id: string, @Req() req: any) {
        return this.quotationsService.send(+id, req.user.id);
    }

    @Post(':id/accept')
    accept(@Param('id') id: string, @Req() req: any) {
        return this.quotationsService.accept(+id, req.user.id);
    }

    @Post(':id/reject')
    reject(@Param('id') id: string, @Req() req: any) {
        return this.quotationsService.reject(+id, req.user.id);
    }

    @Post(':id/cancel')
    cancel(@Param('id') id: string, @Req() req: any) {
        return this.quotationsService.cancel(+id, req.user.id);
    }

    @Post(':id/convert-to-order')
    convertToSalesOrder(@Param('id') id: string, @Req() req: any) {
        return this.quotationsService.convertToSalesOrder(+id, req.user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateQuotationDto) {
        return this.quotationsService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.quotationsService.remove(+id);
    }
}
