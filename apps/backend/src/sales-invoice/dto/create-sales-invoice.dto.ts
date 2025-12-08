import { IsInt, IsOptional, IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class InvoiceItemDto {
    @IsInt()
    productId: number;

    @IsInt()
    quantity: number;

    @IsNumber()
    price: number;

    @IsNumber()
    @IsOptional()
    taxRate?: number;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateSalesInvoiceDto {
    @IsInt()
    customerId: number;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    deliveryChallanIds?: number[];
}
