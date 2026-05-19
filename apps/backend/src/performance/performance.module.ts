import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
