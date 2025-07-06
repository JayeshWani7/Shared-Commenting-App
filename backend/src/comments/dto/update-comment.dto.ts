import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ example: 'This is an updated comment!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
