import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';
import { WarrantyStatus } from '@prisma/client';

export class CreateWarrantyClaimDto {
    @IsInt()
    saleItemId: number;

    @IsString()
    description: string;
}

export class UpdateWarrantyClaimDto {
    @IsEnum(WarrantyStatus)
    @IsOptional()
    status?: WarrantyStatus;

    @IsString()
    @IsOptional()
    resolution?: string;
}
