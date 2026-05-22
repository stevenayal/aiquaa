import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiquaaTalentModule } from '../integrations/aiquaa-talent/aiquaa-talent.module';

@Module({
  imports: [PrismaModule, CqrsModule, AiquaaTalentModule],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
