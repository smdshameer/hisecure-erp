import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateSettingDto {
    @IsString()
    @IsNotEmpty()
    key: string;

    @IsString()
    @IsNotEmpty()
    value: string; // JSON string or simple value

    @IsString()
    @IsOptional()
    module?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
