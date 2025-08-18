import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token de refresh',
    example: 'abc123...',
  })
  refresh_token: string;

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
  user: {
    id: number;
    email: string;
    name?: string;
    role: string;
    emailVerifiedAt?: Date;
  };
}
