import { IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class QuotationItemDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    unitPrice: number;
}

export class CreateQuotationDto {
    @IsNotEmpty()
    @IsNumber()
    customerId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuotationItemDto)
    items: QuotationItemDto[];

    @IsOptional()
    @IsString()
    status?: string;
}
