import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class CreateServiceTicketDto {
    @IsString()
    description: string;

    @IsInt()
    customerId: number;

    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @IsOptional()
    @IsInt()
    technicianId?: number;
}
