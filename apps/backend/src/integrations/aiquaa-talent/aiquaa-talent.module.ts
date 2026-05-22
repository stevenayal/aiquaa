import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiquaaTalentWebhookClient } from './aiquaa-talent-webhook.client';
import { AiquaaTalentWebhookService } from './aiquaa-talent-webhook.service';

@Module({
  imports: [ConfigModule],
  providers: [AiquaaTalentWebhookClient, AiquaaTalentWebhookService],
  exports: [AiquaaTalentWebhookService],
})
export class AiquaaTalentModule {}
