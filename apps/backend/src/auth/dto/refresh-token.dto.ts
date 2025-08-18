import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Token de refresh (opcional, se puede enviar en cookie)',
    example: 'refresh-token-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
