import { IsOptional, IsString } from "class-validator";

export class LoginDto {


 @IsString()
 phoneNumber:string;


 @IsOptional()
 @IsString()
 otp?:string;

}