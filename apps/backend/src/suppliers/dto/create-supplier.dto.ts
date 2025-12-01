import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    contactPerson?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    gstin?: string;

    @IsOptional()
    @IsString()
    state?: string;
}
