import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WarrantyService } from './warranty.service';
import {
  CreateWarrantyClaimDto,
  UpdateWarrantyClaimDto,
} from './dto/create-warranty.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('warranty')
@UseGuards(JwtAuthGuard)
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Post('claims')
  create(@Body() createWarrantyDto: CreateWarrantyClaimDto) {
    return this.warrantyService.createClaim(createWarrantyDto);
  }

  @Get('claims')
  findAll() {
    return this.warrantyService.findAll();
  }

  @Get('claims/:id')
  findOne(@Param('id') id: string) {
    return this.warrantyService.findOne(+id);
  }

  @Patch('claims/:id')
  update(
    @Param('id') id: string,
    @Body() updateWarrantyDto: UpdateWarrantyClaimDto,
  ) {
    return this.warrantyService.update(+id, updateWarrantyDto);
  }

  @Get('check')
  checkWarranty(@Query('invoice') invoice: string) {
    return this.warrantyService.checkWarrantyByInvoice(invoice);
  }
}
