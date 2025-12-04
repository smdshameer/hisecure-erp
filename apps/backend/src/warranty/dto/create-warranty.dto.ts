import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';


export class CreateWarrantyClaimDto {
  @IsInt()
  saleItemId: number;

  @IsString()
  description: string;
}

export class UpdateWarrantyClaimDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  resolution?: string;
}
