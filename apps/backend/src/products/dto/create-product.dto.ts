import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    sku: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    costPrice: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stockQuantity?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    lowStockThreshold?: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsInt()
    warrantyMonths?: number;

    @IsOptional()
    @IsString()
    hsnCode?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    gstRate?: number;

    @IsOptional()
    autoReorder?: boolean;

    @IsOptional()
    @IsInt()
    @Min(1)
    reorderQuantity?: number;
}
