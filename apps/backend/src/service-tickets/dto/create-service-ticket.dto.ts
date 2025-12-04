import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';


export class CreateServiceTicketDto {
  @IsString()
  description: string;

  @IsInt()
  customerId: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  technicianId?: number;
}
