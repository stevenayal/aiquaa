import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateIdeaDto {
  @ApiPropertyOptional({
    description: 'Título de la idea',
    minLength: 10,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la idea',
    minLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(50)
  description?: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría',
  })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Tags para clasificar la idea',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
