import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiquaaTalentWebhookService } from './aiquaa-talent-webhook.service';
import { AiquaaTalentWebhookClient } from './aiquaa-talent-webhook.client';
import { SendWebhookInput } from './aiquaa-talent-webhook.types';

const BASE_INPUT: SendWebhookInput = {
  evaluationId: 'eval-42',
  evaluationType: 'PERFORMANCE',
  candidateEmail: 'ana@empresa.com',
  companyId: 'acme',
  processId: 'proc-7',
  score: 82,
  maxScore: 100,
  passed: true,
};

function makeModule(
  enabled: boolean,
  clientSendImpl: jest.Mock
): Promise<AiquaaTalentWebhookService> {
  return Test.createTestingModule({
    providers: [
      AiquaaTalentWebhookService,
      {
        provide: AiquaaTalentWebhookClient,
        useValue: { send: clientSendImpl },
      },
      {
        provide: ConfigService,
        useValue: {
          get: (key: string, def?: unknown) => {
            if (key === 'AIQUAA_TALENT_WEBHOOK_ENABLED')
              return enabled ? 'true' : 'false';
            return def;
          },
        },
      },
    ],
  })
    .compile()
    .then((m: TestingModule) => m.get(AiquaaTalentWebhookService));
}

describe('AiquaaTalentWebhookService', () => {
  describe('when WEBHOOK_ENABLED=false', () => {
    it('skips send and returns skipped result', async () => {
      const sendMock = jest.fn();
      const svc = await makeModule(false, sendMock);

      const result = await svc.sendEvaluationCompleted(BASE_INPUT);

      expect(result.skipped).toBe(true);
      expect(result.skipReason).toBe('WEBHOOK_DISABLED');
      expect(result.sent).toBe(false);
      expect(sendMock).not.toHaveBeenCalled();
    });
  });

  describe('when WEBHOOK_ENABLED=true', () => {
    it('sends on 2xx and returns sent=true', async () => {
      const sendMock = jest.fn().mockResolvedValue({ status: 200, ok: true });
      const svc = await makeModule(true, sendMock);

      const result = await svc.sendEvaluationCompleted(BASE_INPUT);

      expect(result.sent).toBe(true);
      expect(result.attempts).toBe(1);
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it('skips when no process identifier provided', async () => {
      const sendMock = jest.fn();
      const svc = await makeModule(true, sendMock);

      const input: SendWebhookInput = { ...BASE_INPUT, processId: undefined };
      const result = await svc.sendEvaluationCompleted(input);

      expect(result.skipped).toBe(true);
      expect(result.skipReason).toBe('MISSING_PROCESS_IDENTIFIER');
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('sets status=PASSED when passed=true', async () => {
      let capturedPayload: any;
      const sendMock = jest.fn().mockImplementation(async (payload) => {
        capturedPayload = payload;
        return { status: 200, ok: true };
      });
      const svc = await makeModule(true, sendMock);

      await svc.sendEvaluationCompleted({ ...BASE_INPUT, passed: true });
      expect(capturedPayload.evaluation.status).toBe('PASSED');
    });

    it('sets status=FAILED when passed=false', async () => {
      let capturedPayload: any;
      const sendMock = jest.fn().mockImplementation(async (payload) => {
        capturedPayload = payload;
        return { status: 200, ok: true };
      });
      const svc = await makeModule(true, sendMock);

      await svc.sendEvaluationCompleted({ ...BASE_INPUT, passed: false });
      expect(capturedPayload.evaluation.status).toBe('FAILED');
    });

    it('sets status=PENDING_REVIEW when pendingReview=true', async () => {
      let capturedPayload: any;
      const sendMock = jest.fn().mockImplementation(async (payload) => {
        capturedPayload = payload;
        return { status: 200, ok: true };
      });
      const svc = await makeModule(true, sendMock);

      await svc.sendEvaluationCompleted({ ...BASE_INPUT, pendingReview: true });
      expect(capturedPayload.evaluation.status).toBe('PENDING_REVIEW');
    });

    it('retries up to 3 times on 5xx then returns sent=false', async () => {
      const sendMock = jest.fn().mockResolvedValue({ status: 500, ok: false });
      const svc = await makeModule(true, sendMock);

      // Patch sleep to avoid real delays in tests
      jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return 0 as any;
      });

      const result = await svc.sendEvaluationCompleted(BASE_INPUT);

      expect(result.sent).toBe(false);
      expect(result.attempts).toBe(3);
      expect(sendMock).toHaveBeenCalledTimes(3);

      jest.restoreAllMocks();
    }, 15000);

    it('retries on error then succeeds on 2nd attempt', async () => {
      const sendMock = jest
        .fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce({ status: 200, ok: true });

      jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return 0 as any;
      });

      const svc = await makeModule(true, sendMock);
      const result = await svc.sendEvaluationCompleted(BASE_INPUT);

      expect(result.sent).toBe(true);
      expect(result.attempts).toBe(2);

      jest.restoreAllMocks();
    });

    it('payload does not contain passwords or raw secrets', async () => {
      let capturedPayload: any;
      const sendMock = jest.fn().mockImplementation(async (payload) => {
        capturedPayload = payload;
        return { status: 200, ok: true };
      });
      const svc = await makeModule(true, sendMock);

      await svc.sendEvaluationCompleted(BASE_INPUT);

      const payloadStr = JSON.stringify(capturedPayload);
      expect(payloadStr).not.toMatch(/password|secret|token.*secret/i);
      // eventId must be a UUID
      expect(capturedPayload.eventId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('payload uses applicationId as processId when processId absent', async () => {
      let capturedPayload: any;
      const sendMock = jest.fn().mockImplementation(async (payload) => {
        capturedPayload = payload;
        return { status: 200, ok: true };
      });
      const svc = await makeModule(true, sendMock);

      await svc.sendEvaluationCompleted({
        ...BASE_INPUT,
        processId: undefined,
        applicationId: 'app-99',
      });

      expect(capturedPayload.process.processId).toBe('app-99');
      expect(capturedPayload.process.applicationId).toBe('app-99');
    });

    it('payload structure matches spec', async () => {
      let capturedPayload: any;
      const sendMock = jest.fn().mockImplementation(async (payload) => {
        capturedPayload = payload;
        return { status: 200, ok: true };
      });
      const svc = await makeModule(true, sendMock);

      await svc.sendEvaluationCompleted(BASE_INPUT);

      expect(capturedPayload).toMatchObject({
        eventType: 'candidate.evaluation.completed',
        source: 'aiquaa',
        tenant: { companyId: 'acme' },
        candidate: { email: 'ana@empresa.com' },
        process: { processId: 'proc-7' },
        evaluation: {
          evaluationId: 'eval-42',
          score: 82,
          maxScore: 100,
          status: 'PASSED',
        },
      });
    });
  });
});
