import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SubmitAttemptDto {
  @ApiPropertyOptional({ description: 'Resumen ejecutivo del candidato' })
  @IsOptional()
  @IsString()
  summary?: string;
}
