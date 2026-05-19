import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';

@Module({
  imports: [CqrsModule],
  controllers: [LabsController],
  providers: [LabsService],
})
export class LabsModule {}
