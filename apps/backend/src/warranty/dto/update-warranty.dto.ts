import { PartialType } from '@nestjs/mapped-types';
import { CreateWarrantyClaimDto } from './create-warranty.dto';

export class UpdateWarrantyClaimDto extends PartialType(
  CreateWarrantyClaimDto,
) {}
