import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@Injectable()
export class InteractionsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, createInteractionDto: CreateInteractionDto) {
        return this.prisma.interaction.create({
            data: {
                ...createInteractionDto,
                userId,
            },
            include: {
                user: true,
            },
        });
    }

    async findAllByCustomer(customerId: number) {
        return this.prisma.interaction.findMany({
            where: { customerId },
            include: {
                user: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
    }
}
