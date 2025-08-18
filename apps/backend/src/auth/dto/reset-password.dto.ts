import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de reset de contraseña',
    example: 'reset-token-123',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'newpassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
