import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ApprovalStatus } from '../../../generated/prisma/enums.js';
import { Type } from 'class-transformer';

export class AdminFindDto {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}