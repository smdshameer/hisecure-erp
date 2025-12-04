import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';


export class CreateInteractionDto {
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsInt()
    customerId: number;
}
