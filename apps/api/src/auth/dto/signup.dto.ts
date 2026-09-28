import { IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName: string;
}
