import { Module } from '@nestjs/common';
import { IdeasBoardController } from './ideas-board.controller';
import { IdeasBoardService } from './ideas-board.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, AppCacheModule],
  controllers: [IdeasBoardController],
  providers: [IdeasBoardService],
  exports: [IdeasBoardService],
})
export class IdeasBoardModule {}
