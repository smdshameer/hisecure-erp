import { IsString, IsEmail, IsPhoneNumber, IsOptional, IsEnum } from 'class-validator';
import { EnquiryStatus } from '@prisma/client';

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
    @IsEnum(EnquiryStatus)
    status?: EnquiryStatus;
}
