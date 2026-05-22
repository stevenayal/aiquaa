import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IstqbController } from './istqb.controller';
import { IstqbService } from './istqb.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';
import { AiquaaTalentModule } from '../integrations/aiquaa-talent/aiquaa-talent.module';

@Module({
  imports: [PrismaModule, MailerModule, CqrsModule, AiquaaTalentModule],
  controllers: [IstqbController],
  providers: [IstqbService],
  exports: [IstqbService],
})
export class IstqbModule {}
