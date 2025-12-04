import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';


export class CreateEnquiryDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  status?: string;
}
