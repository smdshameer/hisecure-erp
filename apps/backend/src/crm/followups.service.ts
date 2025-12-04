import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowUpDto, UpdateFollowUpDto } from './dto/create-followup.dto';

@Injectable()
export class FollowUpsService {
    constructor(private prisma: PrismaService) { }

    async create(createFollowUpDto: CreateFollowUpDto) {
        return this.prisma.followUp.create({
            data: createFollowUpDto,
        });
    }

    async findAllPending() {
        return this.prisma.followUp.findMany({
            where: { status: 'PENDING' },
            include: {
                customer: true,
                assignedTo: true,
            },
            orderBy: {
                date: 'asc',
            },
        });
    }

    async findAllByCustomer(customerId: number) {
        return this.prisma.followUp.findMany({
            where: { customerId },
            orderBy: {
                date: 'desc',
            },
        });
    }

    async update(id: number, updateFollowUpDto: UpdateFollowUpDto) {
        return this.prisma.followUp.update({
            where: { id },
            data: updateFollowUpDto,
        });
    }
}
