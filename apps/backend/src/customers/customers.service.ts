import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  async create(createCustomerDto: CreateCustomerDto) {
    // Check if customer with same email or phone already exists
    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { email: createCustomerDto.email },
          { phone: createCustomerDto.phone },
        ],
      },
    });

    if (existingCustomer) {
      throw new Error(
        'Customer already exists with this email or phone number',
      );
    }

    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  findAll() {
    return this.prisma.customer.findMany();
  }

  findOne(id: number) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  remove(id: number) {
    return this.prisma.customer.delete({ where: { id } });
  }

  async getTimeline(customerId: number) {
    const [sales, tickets, interactions, followUps, complaints] = await Promise.all([
      this.prisma.sale.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.serviceTicket.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.interaction.findMany({ where: { customerId }, orderBy: { date: 'desc' }, include: { user: true } }),
      this.prisma.followUp.findMany({ where: { customerId }, orderBy: { date: 'desc' }, include: { assignedTo: true } }),
      this.prisma.complaint.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const timeline = [
      ...sales.map((s: any) => ({ type: 'SALE', date: s.createdAt, data: s })),
      ...tickets.map((t: any) => ({ type: 'TICKET', date: t.createdAt, data: t })),
      ...interactions.map((i: any) => ({ type: 'INTERACTION', date: i.date, data: i })),
      ...followUps.map((f: any) => ({ type: 'FOLLOW_UP', date: f.date, data: f })),
      ...complaints.map((c: any) => ({ type: 'COMPLAINT', date: c.createdAt, data: c })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline;
  }

  async getInsights(customerId: number) {
    const sales = await this.prisma.sale.findMany({ where: { customerId } });
    const totalSpend = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const lastVisit = sales.length > 0 ? sales[sales.length - 1].createdAt : null;

    return {
      totalSpend,
      totalOrders: sales.length,
      lastVisit,
    };
  }
}
