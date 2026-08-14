import { IsUUID } from 'class-validator';

export class AddInterestDto {
  @IsUUID()
  interestId: string;
}