import { Module } from '@nestjs/common';
import { IstqbController } from './istqb.controller';
import { IstqbService } from './istqb.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [PrismaModule, MailerModule, GamificationModule],
  controllers: [IstqbController],
  providers: [IstqbService],
  exports: [IstqbService],
})
export class IstqbModule {}
