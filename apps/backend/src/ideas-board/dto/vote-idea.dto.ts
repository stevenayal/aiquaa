import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class VoteIdeaDto {
  @ApiProperty({
    description: 'Valor del voto: +1 para upvote, -1 para downvote',
    enum: [1, -1],
    example: 1,
  })
  @IsIn([1, -1], { message: 'El valor del voto debe ser 1 o -1' })
  value!: number;
}
