import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';


export class CreateComplaintDto {
    @IsString()
    subject: string;

    @IsString()
    description: string;

    @IsString()
    priority: string;

    @IsInt()
    customerId: number;
}

export class UpdateComplaintDto {
    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsString()
    resolution?: string;
}
