import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { InteractionType } from '@prisma/client';

export class CreateInteractionDto {
    @IsEnum(InteractionType)
    type: InteractionType;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsInt()
    customerId: number;
}
