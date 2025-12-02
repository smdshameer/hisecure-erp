import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

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
