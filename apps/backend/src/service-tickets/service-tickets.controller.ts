import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServiceTicketsService } from './service-tickets.service';
import { CreateServiceTicketDto } from './dto/create-service-ticket.dto';
import { UpdateServiceTicketDto } from './dto/update-service-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('service-tickets')
@UseGuards(JwtAuthGuard)
export class ServiceTicketsController {
  constructor(private readonly serviceTicketsService: ServiceTicketsService) { }

  @Post()
  create(@Body() createServiceTicketDto: CreateServiceTicketDto) {
    return this.serviceTicketsService.create(createServiceTicketDto);
  }

  @Get()
  findAll() {
    return this.serviceTicketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceTicketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceTicketDto: UpdateServiceTicketDto) {
    return this.serviceTicketsService.update(+id, updateServiceTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceTicketsService.remove(+id);
  }
}
