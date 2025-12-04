/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  Patch,
  Delete,
} from '@nestjs/common';
import type { Response } from 'express';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto'; // Assuming this import exists or is needed for @Patch
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
  ) { }

  @Post()
  async create(@Request() req: any, @Body() createSaleDto: CreateSaleDto) {
    const sale = await this.salesService.create(createSaleDto, req.user.userId);

    // Send email if customer email is available (mocking for now as we don't always have customer email in sale)
    // In a real app, we'd fetch the customer or use the user's email if logged in
    if (req.user && req.user.email) {
      this.mailService
        .sendInvoice(req.user.email, sale.invoiceNo, Number(sale.totalAmount))
        .catch(console.error);
    }

    return sale;
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @Get(':id/invoice')
  async getInvoice(@Param('id') id: string, @Res() res: Response) {
    const sale = await this.salesService.findOne(+id);
    if (!sale) {
      res.status(404).send('Sale not found');
      return;
    }
    const buffer = await this.pdfService.generateInvoice(sale);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${sale.invoiceNo}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
