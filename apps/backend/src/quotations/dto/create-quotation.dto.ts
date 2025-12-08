import { IsInt, IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuotationItemDto {
    @IsInt()
    productId: number;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsNumber()
    unitPrice: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    discount?: number;

    @IsOptional()
    @IsNumber()
    taxRate?: number;
}

export class CreateQuotationDto {
    @IsInt()
    customerId: number;

    @IsOptional()
    @IsDateString()
    quoteDate?: string;

    @IsOptional()
    @IsDateString()
    validityDate?: string;

    @IsOptional()
    @IsString()
    remarks?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuotationItemDto)
    items: QuotationItemDto[];
}
