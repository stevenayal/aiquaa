import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Compatibilidad legacy. El backend actual lee el refresh token desde cookie HTTP-only.',
    example: 'legacy-refresh-token',
    required: false,
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
