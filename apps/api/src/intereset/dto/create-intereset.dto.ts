import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateInterestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}