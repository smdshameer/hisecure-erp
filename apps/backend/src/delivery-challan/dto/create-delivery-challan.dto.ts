import { IsInt, IsOptional, IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class DCItemDto {
    @IsInt()
    productId: number;

    @IsInt()
    quantity: number;

    @IsString()
    @IsOptional()
    unit?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    serialNumbers?: string;
}

export class CreateDeliveryChallanDto {
    @IsString()
    type: string; // SO, TRANSFER, etc

    @IsInt()
    fromWarehouseId: number;

    @IsInt()
    @IsOptional()
    toWarehouseId?: number;

    @IsInt()
    @IsOptional()
    customerId?: number;

    @IsInt()
    @IsOptional()
    salesOrderId?: number;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DCItemDto)
    items: DCItemDto[];
}
