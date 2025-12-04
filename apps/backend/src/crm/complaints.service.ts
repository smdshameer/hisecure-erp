import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto/create-complaint.dto';

@Injectable()
export class ComplaintsService {
    constructor(private prisma: PrismaService) { }

    async create(createComplaintDto: CreateComplaintDto) {
        return this.prisma.complaint.create({
            data: createComplaintDto,
        });
    }

    async findAll() {
        return this.prisma.complaint.findMany({
            include: {
                customer: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findAllByCustomer(customerId: number) {
        return this.prisma.complaint.findMany({
            where: { customerId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async update(id: number, updateComplaintDto: UpdateComplaintDto) {
        return this.prisma.complaint.update({
            where: { id },
            data: updateComplaintDto,
        });
    }
}
