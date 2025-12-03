import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'URL del avatar del usuario',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'USER',
    enum: ['USER', 'MODERATOR', 'ADMIN'],
  })
  role!: string;

  @ApiProperty({
    description: 'Fecha de verificación del email',
    example: '2024-12-08T12:00:00.000Z',
    required: false,
  })
  emailVerifiedAt?: Date;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-12-08T12:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-12-08T12:00:00.000Z',
  })
  updatedAt!: Date;
}
