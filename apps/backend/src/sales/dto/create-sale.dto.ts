import { IsString, IsNumber, IsOptional, IsInt, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
    @IsInt()
    productId: number;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    price: number;
}

export class CreateSaleDto {
    @IsString()
    paymentMethod: string;

    @IsOptional()
    @IsInt()
    customerId?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSaleItemDto)
    items: CreateSaleItemDto[];
}
