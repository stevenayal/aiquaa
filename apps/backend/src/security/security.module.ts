import { Module } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';
import { AntiSpamGuard } from './anti-spam.guard';

@Module({
  providers: [RateLimitGuard, AntiSpamGuard],
  exports: [RateLimitGuard, AntiSpamGuard],
})
export class SecurityModule {}
