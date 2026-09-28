import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {


 @IsString()
 phoneNumber:string;


 @IsOptional()
 @IsString()
 otp?:string;

 @IsOptional()
 @IsString()
 @MinLength(1)
 @MaxLength(80)
 firstName?: string;

 @IsOptional()
 @IsString()
 @MinLength(1)
 @MaxLength(80)
 lastName?: string;

}
