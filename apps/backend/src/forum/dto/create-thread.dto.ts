import { IsString, IsNotEmpty, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateThreadDto {
  @ApiProperty({ description: 'Título del thread', minLength: 5, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Contenido del thread', minLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  content: string;

  @ApiProperty({ description: 'ID de la categoría' })
  @IsNotEmpty()
  categoryId: number;

  @ApiPropertyOptional({ description: 'Tags del thread', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
