import { IsInt, IsOptional, IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class GrnItemDto {
    @IsInt()
    productId: number;

    @IsInt()
    quantity: number;

    @IsNumber()
    purchasePrice: number;

    @IsString()
    @IsOptional()
    unit?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateGrnDto {
    @IsInt()
    supplierId: number;

    @IsInt()
    warehouseId: number;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GrnItemDto)
    items: GrnItemDto[];
}
