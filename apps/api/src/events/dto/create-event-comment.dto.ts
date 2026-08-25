import {
  IsString,
  MinLength,
} from 'class-validator';

export class CreateEventCommentDto {
  @IsString()
  @MinLength(1)
  content: string;
}