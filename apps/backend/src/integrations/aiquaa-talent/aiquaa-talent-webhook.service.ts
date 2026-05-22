import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { AiquaaTalentWebhookClient } from './aiquaa-talent-webhook.client';
import {
  AiquaaTalentWebhookPayload,
  EvaluationStatus,
  SendWebhookInput,
  WebhookSendResult,
} from './aiquaa-talent-webhook.types';

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class AiquaaTalentWebhookService {
  private readonly logger = new Logger(AiquaaTalentWebhookService.name);
  private readonly enabled: boolean;

  constructor(
    private readonly client: AiquaaTalentWebhookClient,
    config: ConfigService
  ) {
    this.enabled =
      config
        .get<string>('AIQUAA_TALENT_WEBHOOK_ENABLED', 'false')
        .toLowerCase() === 'true';
  }

  async sendEvaluationCompleted(
    input: SendWebhookInput
  ): Promise<WebhookSendResult> {
    if (!this.enabled) {
      this.logger.debug(
        `[AiquaaTalent] Webhook disabled — skipping evaluation=${input.evaluationId}`
      );
      return { sent: false, skipped: true, skipReason: 'WEBHOOK_DISABLED' };
    }

    // Guard: require at least one process identifier
    if (!input.processId && !input.applicationId && !input.publicLinkToken) {
      this.logger.warn(
        `[AiquaaTalent] Missing process identifier for evaluation=${input.evaluationId} — event not sent`
      );
      return {
        sent: false,
        skipped: true,
        skipReason: 'MISSING_PROCESS_IDENTIFIER',
      };
    }

    const processId =
      input.processId ?? input.applicationId ?? input.publicLinkToken!;
    const status: EvaluationStatus = input.pendingReview
      ? 'PENDING_REVIEW'
      : input.passed
        ? 'PASSED'
        : 'FAILED';

    const eventId = randomUUID();
    const payload: AiquaaTalentWebhookPayload = {
      eventId,
      eventType: 'candidate.evaluation.completed',
      occurredAt: new Date().toISOString(),
      source: 'aiquaa',
      tenant: {
        companyId: input.companyId,
      },
      candidate: {
        email: input.candidateEmail,
        ...(input.candidateExternalId && {
          externalId: input.candidateExternalId,
        }),
      },
      process: {
        processId,
        ...(input.applicationId && { applicationId: input.applicationId }),
        ...(input.publicLinkToken && {
          publicLinkToken: input.publicLinkToken,
        }),
      },
      evaluation: {
        evaluationId: input.evaluationId,
        evaluationType: input.evaluationType,
        score: input.score,
        maxScore: input.maxScore,
        status,
        ...(input.summary && { summary: input.summary }),
      },
    };

    return this.sendWithRetry(payload);
  }

  private async sendWithRetry(
    payload: AiquaaTalentWebhookPayload
  ): Promise<WebhookSendResult> {
    const maskedEmail = maskEmail(payload.candidate.email);
    let lastStatusCode: number | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.log(
          `[AiquaaTalent] Sending eventId=${payload.eventId} eventType=${payload.eventType} ` +
            `candidate=${maskedEmail} processId=${payload.process.processId} attempt=${attempt}`
        );

        const result = await this.client.send(payload);
        lastStatusCode = result.statusCode;

        if (result.ok) {
          this.logger.log(
            `[AiquaaTalent] Sent OK eventId=${payload.eventId} status=${result.statusCode} attempt=${attempt}`
          );
          return {
            sent: true,
            eventId: payload.eventId,
            attempts: attempt,
            lastStatusCode: result.statusCode,
          };
        }

        this.logger.warn(
          `[AiquaaTalent] Non-2xx eventId=${payload.eventId} status=${result.statusCode} attempt=${attempt}`
        );
      } catch (err) {
        const error = err as Error;
        this.logger.warn(
          `[AiquaaTalent] Request error eventId=${payload.eventId} attempt=${attempt}: ${error.message}`
        );
      }

      if (attempt < MAX_RETRIES) {
        const backoffMs = BASE_BACKOFF_MS * Math.pow(3, attempt - 1); // 1s, 3s, 9s
        this.logger.debug(`[AiquaaTalent] Retrying in ${backoffMs}ms…`);
        await sleep(backoffMs);
      }
    }

    this.logger.error(
      `[AiquaaTalent] Failed after ${MAX_RETRIES} attempts eventId=${payload.eventId} ` +
        `lastStatus=${lastStatusCode} result=failed`
    );
    return {
      sent: false,
      eventId: payload.eventId,
      attempts: MAX_RETRIES,
      lastStatusCode,
      error: 'MAX_RETRIES_EXCEEDED',
    };
  }
}
