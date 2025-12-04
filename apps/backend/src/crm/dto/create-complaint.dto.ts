import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus, ComplaintPriority } from '@prisma/client';

export class CreateComplaintDto {
    @IsString()
    subject: string;

    @IsString()
    description: string;

    @IsEnum(ComplaintPriority)
    priority: ComplaintPriority;

    @IsInt()
    customerId: number;
}

export class UpdateComplaintDto {
    @IsOptional()
    @IsEnum(ComplaintStatus)
    status?: ComplaintStatus;

    @IsOptional()
    @IsEnum(ComplaintPriority)
    priority?: ComplaintPriority;

    @IsOptional()
    @IsString()
    resolution?: string;
}
