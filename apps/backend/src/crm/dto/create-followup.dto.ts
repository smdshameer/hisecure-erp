import { IsEnum, IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';


export class CreateFollowUpDto {
    @IsISO8601()
    date: string;

    @IsString()
    description: string;

    @IsInt()
    customerId: number;

    @IsOptional()
    @IsInt()
    assignedToId?: number;
}

export class UpdateFollowUpDto {
    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsISO8601()
    date?: string;
}
