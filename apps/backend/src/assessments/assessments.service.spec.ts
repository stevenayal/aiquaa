import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsService } from './assessments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventBus } from '@nestjs/cqrs';
import { Decimal } from '@prisma/client/runtime/library';

const mockAttempt = (testCases: any[], bugReports: any[]) => ({
  id: 1,
  assessmentId: 1,
  userId: null,
  candidateName: 'Test Candidate',
  status: 'IN_PROGRESS',
  startedAt: new Date(),
  submittedAt: null,
  totalScore: null,
  summary: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  testCases,
  bugReports,
});

const mockPrisma = {
  assessment: { findUnique: jest.fn() },
  assessmentAttempt: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  assessmentTestCase: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  assessmentBugReport: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  assessmentScore: {
    upsert: jest.fn(),
  },
};

describe('AssessmentsService — autoScore', () => {
  let service: AssessmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventBus, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);

    mockPrisma.assessmentScore.upsert.mockResolvedValue({});
  });

  afterEach(() => jest.clearAllMocks());

  describe('Test Design scoring', () => {
    it('scores 0 for empty test cases', async () => {
      mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(
        mockAttempt([], [])
      );
      mockPrisma.assessmentAttempt.update.mockResolvedValue({});

      const result = await (service as any).autoScore(
        1,
        mockAttempt([], []),
        undefined
      );

      expect(result.testDesignScore).toBe(0);
    });

    it('scores max 25 for 5+ cases covering all 5 types', async () => {
      const testCases = [
        { type: 'positive' },
        { type: 'negative' },
        { type: 'boundary' },
        { type: 'security' },
        { type: 'contract' },
      ];
      const attempt = mockAttempt(testCases, []);
      const result = await (service as any).autoScore(1, attempt, undefined);

      expect(result.testDesignScore).toBe(25);
    });

    it('scores partial for 3 cases with 2 types', async () => {
      const testCases = [
        { type: 'positive' },
        { type: 'positive' },
        { type: 'negative' },
      ];
      const attempt = mockAttempt(testCases, []);
      const result = await (service as any).autoScore(1, attempt, undefined);

      expect(result.testDesignScore).toBeGreaterThan(0);
      expect(result.testDesignScore).toBeLessThan(25);
    });
  });

  describe('Bug tag scoring — Security', () => {
    it('detects IDOR on account endpoint (bug #1)', async () => {
      const bugReports = [
        {
          title:
            'GET /accounts/{id} returns data from acc_002 without ownership check',
          description: 'IDOR vulnerability',
          stepsToReproduce: 'Login as user A, GET /accounts/acc_002',
          actualResult: 'Returns acc_002 data',
          expectedResult: '403 Forbidden',
          severity: 'critical',
          priority: 'critical',
          endpoint: 'GET /accounts/{accountId}',
          evidence: null,
        },
      ];
      const attempt = mockAttempt([], bugReports);
      const result = await (service as any).autoScore(1, attempt, undefined);

      expect(result.securityScore).toBeGreaterThan(0);
      expect(result.bugsFound).toBeGreaterThan(0);
    });

    it('detects sensitive data exposure (bug #6)', async () => {
      const bugReports = [
        {
          title: 'GET /users/me exposes internalRiskScore field',
          description: 'Sensitive data exposed in API response',
          stepsToReproduce: 'GET /users/me',
          actualResult: 'Response includes internalRiskScore: 42',
          expectedResult: 'No sensitive internal fields in response',
          severity: 'high',
          priority: 'high',
          endpoint: 'GET /users/me',
          evidence: null,
        },
      ];
      const attempt = mockAttempt([], bugReports);
      const result = await (service as any).autoScore(1, attempt, undefined);

      expect(result.securityScore).toBeGreaterThan(0);
    });
  });

  describe('Bug tag scoring — API Validation', () => {
    it('detects zero amount transfer (bug #2)', async () => {
      const bugReports = [
        {
          title: 'POST /transfers accepts amount 0',
          description: 'API accepts monto 0 without validation error',
          stepsToReproduce: 'POST /transfers with amount: 0',
          actualResult: 'HTTP 201 transfer created',
          expectedResult: 'HTTP 400 bad request',
          severity: 'medium',
          priority: 'high',
          endpoint: 'POST /transfers',
          evidence: null,
        },
      ];
      const attempt = mockAttempt([], bugReports);
      const result = await (service as any).autoScore(1, attempt, undefined);

      expect(result.apiValidationScore).toBeGreaterThan(0);
    });

    it('detects OpenAPI contract mismatch (bug #8)', async () => {
      const bugReports = [
        {
          title:
            'GET /accounts returns balance but OpenAPI spec says availableBalance',
          description: 'Contract mismatch between spec and implementation',
          stepsToReproduce: 'Compare GET /accounts response with openapi spec',
          actualResult: 'Field named balance',
          expectedResult: 'Field should be named availableBalance per spec',
          severity: 'medium',
          priority: 'medium',
          endpoint: 'GET /accounts',
          evidence: null,
        },
      ];
      const attempt = mockAttempt([], bugReports);
      const result = await (service as any).autoScore(1, attempt, undefined);

      expect(result.apiValidationScore).toBeGreaterThan(0);
    });
  });

  describe('Pass/fail threshold', () => {
    it('passes when total score >= 70', async () => {
      const testCases = Array.from({ length: 5 }, (_, i) => ({
        type: ['positive', 'negative', 'boundary', 'security', 'contract'][i],
      }));
      const bugReports = [
        {
          title: 'IDOR on acc_002 — no ownership check',
          description: 'authorization idor vulnerability',
          stepsToReproduce: 'GET /accounts/acc_002 as user A',
          actualResult: '200 OK with acc_002 data',
          expectedResult: '403',
          severity: 'critical',
          priority: 'critical',
          endpoint: 'GET /accounts/{accountId}',
          evidence: 'HTTP 200 { id: acc_002, ownerId: usr_002 }',
        },
        {
          title: 'Sensitive internalRiskScore exposed',
          description: 'internalRiskScore riesgo dato sensible',
          stepsToReproduce: 'GET /users/me',
          actualResult: 'internalRiskScore: 42 in response',
          expectedResult: 'No internal fields',
          severity: 'high',
          priority: 'high',
          endpoint: 'GET /users/me',
          evidence: 'internalRiskScore: 42',
        },
        {
          title: 'Transfer ownership check missing — idor transferencia',
          description: 'otro usuario can read transfers',
          stepsToReproduce: 'GET /transfers/{id} for transfer of another user',
          actualResult: '200 OK',
          expectedResult: '403',
          severity: 'critical',
          priority: 'critical',
          endpoint: 'GET /transfers/{transferId}',
          evidence: 'HTTP 200',
        },
        {
          title: 'amount 0 accepted — monto 0',
          description: 'zero amount transfer succeeds',
          stepsToReproduce: 'POST /transfers with amount: 0',
          actualResult: 'HTTP 201',
          expectedResult: 'HTTP 400',
          severity: 'medium',
          priority: 'high',
          endpoint: 'POST /transfers',
          evidence: 'HTTP 201 OK',
        },
        {
          title: 'Wrong status 200 on validation error — status code',
          description: '400 código de estado incorrect',
          stepsToReproduce: 'POST /transfers with unknown fromAccount',
          actualResult: 'HTTP 200 with error message',
          expectedResult: 'HTTP 404 or 400',
          severity: 'high',
          priority: 'high',
          endpoint: 'POST /transfers',
          evidence: 'HTTP 200',
        },
      ];

      const summary =
        'API de Banca Digital AIQUAA presenta múltiples vulnerabilidades críticas de seguridad (IDOR, datos sensibles), validación incorrecta (monto cero, balance), y errores de contrato OpenAPI. Recomendamos corrección urgente antes del lanzamiento.';

      const attempt = mockAttempt(testCases, bugReports as any);
      const result = await (service as any).autoScore(1, attempt, summary);

      expect(result.totalScore).toBeGreaterThanOrEqual(70);
      expect(result.passed).toBe(true);
    });

    it('fails when total score < 70', async () => {
      const attempt = mockAttempt([], []);
      const result = await (service as any).autoScore(1, attempt, undefined);

      expect(result.totalScore).toBeLessThan(70);
      expect(result.passed).toBe(false);
    });
  });

  describe('Bug report quality scoring', () => {
    it('scores higher with evidence and detailed steps', async () => {
      const withEvidence = [
        {
          stepsToReproduce:
            'Step 1: Login\nStep 2: GET /accounts/acc_002\nStep 3: Observe response',
          severity: 'critical',
          priority: 'critical',
          evidence: 'HTTP 200 { "id": "acc_002", "ownerId": "usr_002" }',
        },
      ];
      const withoutEvidence = [
        {
          stepsToReproduce: 'ok',
          severity: 'medium',
          priority: 'medium',
          evidence: null,
        },
      ];

      const r1 = (service as any).scoreBugReportQuality(withEvidence);
      const r2 = (service as any).scoreBugReportQuality(withoutEvidence);

      expect(r1).toBeGreaterThan(r2);
    });
  });

  describe('Summary scoring', () => {
    it('scores 0 for empty summary', () => {
      expect((service as any).scoreSummary(undefined)).toBe(0);
      expect((service as any).scoreSummary('')).toBe(0);
    });

    it('scores higher with keywords and length', () => {
      const good =
        'La API de banca digital presenta vulnerabilidades de seguridad (IDOR, datos sensibles), validación incorrecta (monto cero, balance negativo), y errores de contrato OpenAPI (availableBalance). Recomendamos corrección urgente.';
      const minimal = 'x'.repeat(100);

      expect((service as any).scoreSummary(good)).toBeGreaterThan(
        (service as any).scoreSummary(minimal)
      );
    });
  });
});
