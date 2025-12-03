import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IdeaStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la idea',
    enum: IdeaStatus,
    example: IdeaStatus.APPROVED,
  })
  @IsEnum(IdeaStatus, {
    message: 'Estado inválido. Debe ser: PENDING, APPROVED, IN_PROGRESS, COMPLETED, o REJECTED',
  })
  status: IdeaStatus;
}
