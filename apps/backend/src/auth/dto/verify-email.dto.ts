import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Token de verificación de email',
    example: 'verify-token-123',
  })
  @IsString()
  token!: string;
}
