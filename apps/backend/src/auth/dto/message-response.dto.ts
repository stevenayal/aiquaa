import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Mensaje de respuesta',
    example: 'Operación completada exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Código de estado',
    example: 'SUCCESS',
    required: false,
  })
  code?: string;
}
