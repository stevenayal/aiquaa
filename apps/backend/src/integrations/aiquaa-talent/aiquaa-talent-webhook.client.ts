import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { signWebhookPayload } from './aiquaa-talent-webhook.signer';
import { AiquaaTalentWebhookPayload } from './aiquaa-talent-webhook.types';

const ENDPOINT_PATH = '/api/integrations/aiquaa/evaluation-result';

export interface HttpResponse {
  status: number;
  ok: boolean;
}

export interface WebhookClientSendResult {
  statusCode: number;
  ok: boolean;
}

/** Injectable wrapper so tests can mock the actual fetch call. */
export type FetchFn = (
  url: string,
  init: RequestInit
) => Promise<{ status: number; ok: boolean }>;

@Injectable()
export class AiquaaTalentWebhookClient {
  private readonly baseUrl: string;
  private readonly secret: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: FetchFn;

  constructor(config: ConfigService, fetchImpl?: FetchFn) {
    this.baseUrl = config.get<string>('AIQUAA_TALENT_WEBHOOK_URL', '');
    this.secret = config.get<string>('AIQUAA_TALENT_WEBHOOK_SECRET', '');
    this.timeoutMs = config.get<number>(
      'AIQUAA_TALENT_WEBHOOK_TIMEOUT_MS',
      8000
    );
    this.fetchFn = fetchImpl ?? ((url, init) => fetch(url, init));
  }

  async send(
    payload: AiquaaTalentWebhookPayload
  ): Promise<WebhookClientSendResult> {
    const url = `${this.baseUrl}${ENDPOINT_PATH}`;
    const rawBody = JSON.stringify(payload);
    const timestampMs = Date.now();
    const signature = signWebhookPayload(this.secret, timestampMs, rawBody);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Aiquaa-Event-Id': payload.eventId,
      'X-Aiquaa-Timestamp': String(timestampMs),
      'X-Aiquaa-Signature': signature,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(url, {
        method: 'POST',
        headers,
        body: rawBody,
        signal: controller.signal as AbortSignal,
      });

      return { statusCode: response.status, ok: response.ok };
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        throw new Error(`Webhook request timed out after ${this.timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
