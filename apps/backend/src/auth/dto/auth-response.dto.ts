import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    nullable: true,
  })
  access_token!: string | null;

  @ApiProperty({
    description: 'Usuario autenticado',
    example: {
      id: 1,
      email: 'user@example.com',
      name: 'Juan Pérez',
      role: 'USER',
      emailVerifiedAt: '2024-12-08T12:00:00.000Z',
    },
  })
  user!: {
    id: number;
    email: string;
    name?: string;
    role: string;
    emailVerifiedAt?: Date;
  };

  @ApiProperty({
    description: 'Indica si el login requiere un segundo factor antes de emitir tokens',
    example: false,
    required: false,
  })
  requiresTwoFactor?: boolean;

  @ApiProperty({
    description: 'Mensaje adicional para el cliente',
    example: 'Se ha enviado un código de verificación a tu email',
    required: false,
  })
  message?: string;
}
