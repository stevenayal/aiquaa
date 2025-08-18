import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Contenido del post', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string;
}
