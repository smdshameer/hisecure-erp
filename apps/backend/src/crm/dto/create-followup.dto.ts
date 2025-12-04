import { IsEnum, IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';
import { FollowUpStatus } from '@prisma/client';

export class CreateFollowUpDto {
    @IsISO8601()
    date: string;

    @IsString()
    description: string;

    @IsInt()
    customerId: number;

    @IsOptional()
    @IsInt()
    assignedToId?: number;
}

export class UpdateFollowUpDto {
    @IsOptional()
    @IsEnum(FollowUpStatus)
    status?: FollowUpStatus;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsISO8601()
    date?: string;
}
