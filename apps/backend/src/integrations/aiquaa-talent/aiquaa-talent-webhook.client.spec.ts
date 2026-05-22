import { ConfigService } from '@nestjs/config';
import {
  AiquaaTalentWebhookClient,
  FetchFn,
} from './aiquaa-talent-webhook.client';
import { AiquaaTalentWebhookPayload } from './aiquaa-talent-webhook.types';

const BASE_PAYLOAD: AiquaaTalentWebhookPayload = {
  eventId: 'evt-001',
  eventType: 'candidate.evaluation.completed',
  occurredAt: '2026-01-15T10:30:00.000Z',
  source: 'aiquaa',
  tenant: { companyId: 'acme' },
  candidate: { email: 'candidato@correo.com' },
  process: { processId: 'proc-42' },
  evaluation: {
    evaluationId: 'eval-7',
    evaluationType: 'PERFORMANCE',
    score: 82,
    maxScore: 100,
    status: 'PASSED',
  },
};

function makeClient(fetchFn: FetchFn, overrides: Record<string, string> = {}) {
  const config = {
    get: (key: string, def?: unknown) => {
      const map: Record<string, string> = {
        AIQUAA_TALENT_WEBHOOK_URL: 'https://talent.example.com',
        AIQUAA_TALENT_WEBHOOK_SECRET: 'test-secret-32chars-xxxxxxxxxxx',
        AIQUAA_TALENT_WEBHOOK_TIMEOUT_MS: '8000',
        ...overrides,
      };
      return map[key] ?? def;
    },
  } as unknown as ConfigService;

  return new AiquaaTalentWebhookClient(config, fetchFn);
}

describe('AiquaaTalentWebhookClient', () => {
  it('sends POST to correct URL', async () => {
    const calls: string[] = [];
    const fetchFn: FetchFn = async (url) => {
      calls.push(url as string);
      return { status: 200, ok: true };
    };

    await makeClient(fetchFn).send(BASE_PAYLOAD);
    expect(calls[0]).toBe(
      'https://talent.example.com/api/integrations/aiquaa/evaluation-result'
    );
  });

  it('sends required headers', async () => {
    let capturedHeaders: Record<string, string> = {};
    const fetchFn: FetchFn = async (_url, init) => {
      capturedHeaders = init.headers as Record<string, string>;
      return { status: 200, ok: true };
    };

    await makeClient(fetchFn).send(BASE_PAYLOAD);
    expect(capturedHeaders['Content-Type']).toBe('application/json');
    expect(capturedHeaders['X-Aiquaa-Event-Id']).toBe('evt-001');
    expect(capturedHeaders['X-Aiquaa-Timestamp']).toMatch(/^\d+$/);
    expect(capturedHeaders['X-Aiquaa-Signature']).toMatch(
      /^sha256=[a-f0-9]{64}$/
    );
  });

  it('returns ok=true on 2xx', async () => {
    const fetchFn: FetchFn = async () => ({ status: 200, ok: true });
    const result = await makeClient(fetchFn).send(BASE_PAYLOAD);
    expect(result.ok).toBe(true);
    expect(result.statusCode).toBe(200);
  });

  it('returns ok=false on 5xx', async () => {
    const fetchFn: FetchFn = async () => ({ status: 500, ok: false });
    const result = await makeClient(fetchFn).send(BASE_PAYLOAD);
    expect(result.ok).toBe(false);
    expect(result.statusCode).toBe(500);
  });

  it('throws on timeout (AbortError)', async () => {
    const fetchFn: FetchFn = async () => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    };

    const client = makeClient(fetchFn, {
      AIQUAA_TALENT_WEBHOOK_TIMEOUT_MS: '1',
    });
    await expect(client.send(BASE_PAYLOAD)).rejects.toThrow(/timed out/i);
  });

  it('body does not contain webhook secret', async () => {
    let capturedBody = '';
    const fetchFn: FetchFn = async (_url, init) => {
      capturedBody = init.body as string;
      return { status: 200, ok: true };
    };

    await makeClient(fetchFn).send(BASE_PAYLOAD);
    expect(capturedBody).not.toContain('test-secret-32chars-xxxxxxxxxxx');
  });
});
