import { Injectable } from '@nestjs/common';
import { CreateServiceTicketDto } from './dto/create-service-ticket.dto';
import { UpdateServiceTicketDto } from './dto/update-service-ticket.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceTicketsService {
  constructor(private prisma: PrismaService) { }

  create(createServiceTicketDto: CreateServiceTicketDto) {
    return this.prisma.serviceTicket.create({
      data: createServiceTicketDto,
    });
  }

  findAll() {
    return this.prisma.serviceTicket.findMany({
      include: { customer: true, technician: true, parts: true },
    });
  }

  findOne(id: number) {
    return this.prisma.serviceTicket.findUnique({
      where: { id },
      include: { customer: true, technician: true, parts: true },
    });
  }

  update(id: number, updateServiceTicketDto: UpdateServiceTicketDto) {
    return this.prisma.serviceTicket.update({
      where: { id },
      data: updateServiceTicketDto,
    });
  }

  remove(id: number) {
    return this.prisma.serviceTicket.delete({ where: { id } });
  }
}
