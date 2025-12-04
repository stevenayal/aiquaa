import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { ResendService } from './resend.service';
import { MailerController } from './mailer.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MailerController],
  providers: [MailerService, ResendService],
  exports: [MailerService, ResendService],
})
export class MailerModule {}
