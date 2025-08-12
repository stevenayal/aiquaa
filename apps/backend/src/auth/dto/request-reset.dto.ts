import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetDto {
  @ApiProperty({
    description: 'Email del usuario para reset de contraseña',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
