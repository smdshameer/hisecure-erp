import { IsString, IsInt, IsOptional, IsArray, ValidateNested, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class SalesOrderItemDto {
    @IsInt()
    productId: number;

    @IsInt()
    quantity: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    unit?: string;

    @IsNumber()
    price: number;

    @IsNumber()
    @IsOptional()
    discount?: number;

    @IsNumber()
    @IsOptional()
    taxRate?: number;

    @IsNumber()
    lineTotal: number;
}

export class CreateSalesOrderDto {
    @IsInt()
    customerId: number;

    @IsInt()
    @IsOptional()
    quotationId?: number;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsString()
    @IsOptional()
    status?: string; // DRAFT, CONFIRMED

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SalesOrderItemDto)
    items: SalesOrderItemDto[];
}
