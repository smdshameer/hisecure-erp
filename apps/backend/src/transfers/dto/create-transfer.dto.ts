import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTransferDto {
  @IsOptional()
  @IsNumber()
  sourceBranchId?: number;

  @IsOptional()
  @IsNumber()
  targetBranchId?: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
