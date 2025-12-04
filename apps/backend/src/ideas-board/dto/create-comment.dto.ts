import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Contenido del comentario',
    minLength: 1,
    example: 'Me parece una excelente idea. ¿Han considerado también integrar con Azure DevOps?',
  })
  @IsString()
  @MinLength(1, { message: 'El comentario no puede estar vacío' })
  content!: string;
}
