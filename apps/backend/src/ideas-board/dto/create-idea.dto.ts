import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateIdeaDto {
  @ApiProperty({
    description: 'Título de la idea',
    minLength: 10,
    maxLength: 200,
    example: 'Agregar integración con Jira para gestión de bugs',
  })
  @IsString()
  @MinLength(10, { message: 'El título debe tener al menos 10 caracteres' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Descripción detallada de la idea',
    minLength: 50,
    example:
      'Sería útil poder conectar AIQUAA con Jira para sincronizar bugs encontrados durante las pruebas. Esto ahorraría tiempo al equipo de QA...',
  })
  @IsString()
  @MinLength(50, {
    message: 'La descripción debe tener al menos 50 caracteres',
  })
  description: string;

  @ApiProperty({
    description: 'ID de la categoría',
    example: 1,
  })
  @IsInt()
  categoryId: number;

  @ApiPropertyOptional({
    description: 'Tags opcionales para clasificar la idea',
    type: [String],
    example: ['integraciones', 'jira', 'bug-tracking'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
