import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class SendGroupMessageDto {
  @IsUUID()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}