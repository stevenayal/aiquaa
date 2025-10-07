import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { ResendService } from './resend.service';

@Module({
  imports: [ConfigModule],
  providers: [MailerService, ResendService],
  exports: [MailerService, ResendService],
})
export class MailerModule {}
