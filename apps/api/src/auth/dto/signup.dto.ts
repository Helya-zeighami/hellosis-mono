import { IsString, Matches } from "class-validator";

export class SignupDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'Invalid phone number',
  })
  phoneNumber: string;
}