import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { SaveTestCasesDto } from './dto/save-test-cases.dto';
import { SaveBugReportsDto } from './dto/save-bug-reports.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { AssessmentCompletedEvent } from './events/assessment-completed.event';

const PASS_THRESHOLD = 70;

interface BugTagConfig {
  keywords: string[];
  maxPts: number;
}

const BUG_TAGS: Record<string, BugTagConfig> = {
  'broken-authz-account': {
    keywords: ['acc_002', 'ownership', 'authorization', 'idor', 'cuenta ajena'],
    maxPts: 5,
  },
  'zero-amount': {
    keywords: ['monto 0', 'amount 0', 'cero', 'zero', 'amount: 0'],
    maxPts: 3,
  },
  'negative-amount': {
    keywords: ['negativo', 'negative', 'monto negativo', 'amount negative'],
    maxPts: 3,
  },
  'wrong-status-code': {
    keywords: [
      '200',
      'status',
      '400',
      'código',
      'status code',
      'código de estado',
    ],
    maxPts: 4,
  },
  'insufficient-balance': {
    keywords: ['saldo', 'balance', 'insuficiente', 'insufficient', 'edge'],
    maxPts: 4,
  },
  'sensitive-data': {
    keywords: [
      'internalriskscore',
      'riesgo',
      'sensitiv',
      'dato sensible',
      'risk score',
    ],
    maxPts: 5,
  },
  'transfer-ownership': {
    keywords: [
      'transferencia ajena',
      'otro usuario',
      'idor',
      'transfer ownership',
      'unauthorized transfer',
    ],
    maxPts: 5,
  },
  'openapi-mismatch': {
    keywords: [
      'availablebalance',
      'contrato',
      'spec',
      'openapi',
      'balance field',
      'campo balance',
    ],
    maxPts: 4,
  },
  'long-description': {
    keywords: [
      '120',
      'descripción larga',
      'long description',
      'caracteres',
      'characters',
    ],
    maxPts: 2,
  },
  'expired-token': {
    keywords: [
      'expirado',
      'expired',
      'exp claim',
      'token expirado',
      'token expired',
    ],
    maxPts: 4,
  },
  'missing-idempotency': {
    keywords: [
      'idempotency',
      'idempotencia',
      'duplicado',
      'duplicate transfer',
      'doble transferencia',
    ],
    maxPts: 4,
  },
  'ambiguous-errors': {
    keywords: [
      'ambiguo',
      'vago',
      'mensaje de error',
      'error message',
      'misleading',
    ],
    maxPts: 2,
  },
};

@Injectable()
export class AssessmentsService {
  private readonly logger = new Logger(AssessmentsService.name);

  constructor(
    private prisma: PrismaService,
    private eventBus: EventBus
  ) {}

  async startAttempt(dto: StartAttemptDto, userId?: number) {
    const slug = dto.assessmentSlug ?? 'api-banking';

    const assessment = await this.prisma.assessment.findUnique({
      where: { slug },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment '${slug}' not found`);
    }

    const attempt = await this.prisma.assessmentAttempt.create({
      data: {
        assessmentId: assessment.id,
        userId: userId ?? null,
        candidateName: dto.candidateName,
      },
    });

    this.logger.log(
      `Assessment attempt started: id=${attempt.id} candidate=${dto.candidateName}`
    );

    return { attemptId: attempt.id, assessmentId: assessment.id };
  }

  async saveTestCases(attemptId: number, dto: SaveTestCasesDto) {
    await this.prisma.assessmentTestCase.deleteMany({ where: { attemptId } });

    await this.prisma.assessmentTestCase.createMany({
      data: dto.testCases.map((tc) => ({
        attemptId,
        title: tc.title,
        preconditions: tc.preconditions ?? null,
        steps: tc.steps,
        expectedResult: tc.expectedResult,
        type: tc.type,
        priority: tc.priority,
      })),
    });

    return { success: true, count: dto.testCases.length };
  }

  async saveBugReports(attemptId: number, dto: SaveBugReportsDto) {
    await this.prisma.assessmentBugReport.deleteMany({ where: { attemptId } });

    await this.prisma.assessmentBugReport.createMany({
      data: dto.bugReports.map((br) => ({
        attemptId,
        title: br.title,
        description: br.description ?? null,
        stepsToReproduce: br.stepsToReproduce,
        actualResult: br.actualResult,
        expectedResult: br.expectedResult,
        severity: br.severity,
        priority: br.priority,
        endpoint: br.endpoint,
        evidence: br.evidence ?? null,
      })),
    });

    return { success: true, count: dto.bugReports.length };
  }

  async submitAttempt(
    attemptId: number,
    dto: SubmitAttemptDto,
    userId?: number
  ) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: { testCases: true, bugReports: true },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt ${attemptId} not found`);
    }

    if (dto.summary) {
      await this.prisma.assessmentAttempt.update({
        where: { id: attemptId },
        data: { summary: dto.summary },
      });
    }

    const score = await this.autoScore(attemptId, attempt, dto.summary);

    await this.prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        totalScore: new Decimal(score.totalScore.toFixed(2)),
      },
    });

    const passed = score.totalScore >= PASS_THRESHOLD;
    const effectiveUserId = userId ?? attempt.userId ?? undefined;

    if (effectiveUserId) {
      this.eventBus.publish(
        new AssessmentCompletedEvent(
          effectiveUserId,
          attemptId,
          passed,
          score.totalScore
        )
      );
    }

    return { success: true, attemptId, score };
  }

  async getResult(attemptId: number) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        testCases: true,
        bugReports: true,
        score: true,
        assessment: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt ${attemptId} not found`);
    }

    return attempt;
  }

  private async autoScore(
    attemptId: number,
    attempt: {
      testCases: {
        type: string;
        preconditions: string | null;
        steps: string;
        expectedResult: string;
        severity?: string;
        priority?: string;
        evidence?: string;
      }[];
      bugReports: {
        title: string;
        description: string | null;
        stepsToReproduce: string;
        actualResult: string;
        endpoint: string;
        severity: string;
        priority: string;
        evidence: string | null;
      }[];
    },
    summary?: string
  ) {
    const testDesignScore = this.scoreTestDesign(attempt.testCases);
    const { apiValidationScore, securityScore, taggedBugs } =
      this.scoreBugReports(attempt.bugReports);
    const bugReportingScore = this.scoreBugReportQuality(attempt.bugReports);
    const executiveSummaryScore = this.scoreSummary(summary);

    const totalScore = Math.min(
      100,
      testDesignScore +
        apiValidationScore +
        securityScore +
        bugReportingScore +
        executiveSummaryScore
    );

    const passed = totalScore >= PASS_THRESHOLD;
    const bugsFound = taggedBugs.size;

    const feedback = this.buildFeedback({
      testDesignScore,
      apiValidationScore,
      securityScore,
      bugReportingScore,
      executiveSummaryScore,
      totalScore,
      passed,
      bugsFound,
    });

    await this.prisma.assessmentScore.upsert({
      where: { attemptId },
      create: {
        attemptId,
        testDesignScore: new Decimal(testDesignScore.toFixed(2)),
        apiValidationScore: new Decimal(apiValidationScore.toFixed(2)),
        securityScore: new Decimal(securityScore.toFixed(2)),
        bugReportingScore: new Decimal(bugReportingScore.toFixed(2)),
        executiveSummaryScore: new Decimal(executiveSummaryScore.toFixed(2)),
        totalScore: new Decimal(totalScore.toFixed(2)),
        feedback,
      },
      update: {
        testDesignScore: new Decimal(testDesignScore.toFixed(2)),
        apiValidationScore: new Decimal(apiValidationScore.toFixed(2)),
        securityScore: new Decimal(securityScore.toFixed(2)),
        bugReportingScore: new Decimal(bugReportingScore.toFixed(2)),
        executiveSummaryScore: new Decimal(executiveSummaryScore.toFixed(2)),
        totalScore: new Decimal(totalScore.toFixed(2)),
        feedback,
      },
    });

    return {
      testDesignScore,
      apiValidationScore,
      securityScore,
      bugReportingScore,
      executiveSummaryScore,
      totalScore,
      passed,
      bugsFound,
      totalBugs: Object.keys(BUG_TAGS).length,
      feedback,
    };
  }

  private scoreTestDesign(testCases: { type: string }[]): number {
    if (testCases.length === 0) return 0;

    const countScore = Math.min(15, (testCases.length / 5) * 15);

    const types = new Set(testCases.map((tc) => tc.type));
    const typeVariety = types.size;
    const varietyScore = Math.min(10, (typeVariety / 5) * 10);

    return Math.round(countScore + varietyScore);
  }

  private scoreBugReports(
    bugReports: {
      title: string;
      description: string | null;
      stepsToReproduce: string;
      actualResult: string;
      endpoint: string;
    }[]
  ) {
    const taggedBugs = new Set<string>();
    let apiValidationScore = 0;
    let securityScore = 0;

    const SECURITY_TAGS = new Set([
      'broken-authz-account',
      'sensitive-data',
      'transfer-ownership',
      'expired-token',
    ]);
    const API_TAGS = new Set([
      'zero-amount',
      'negative-amount',
      'wrong-status-code',
      'insufficient-balance',
      'openapi-mismatch',
      'long-description',
      'missing-idempotency',
      'ambiguous-errors',
    ]);

    for (const bug of bugReports) {
      const searchText = [
        bug.title,
        bug.description ?? '',
        bug.stepsToReproduce,
        bug.actualResult,
        bug.endpoint,
      ]
        .join(' ')
        .toLowerCase();

      for (const [tag, config] of Object.entries(BUG_TAGS)) {
        if (taggedBugs.has(tag)) continue;

        const matched = config.keywords.some((kw) =>
          searchText.includes(kw.toLowerCase())
        );
        if (matched) {
          taggedBugs.add(tag);
          if (SECURITY_TAGS.has(tag)) {
            securityScore += config.maxPts;
          } else if (API_TAGS.has(tag)) {
            apiValidationScore += config.maxPts;
          }
        }
      }
    }

    return {
      apiValidationScore: Math.min(25, apiValidationScore),
      securityScore: Math.min(20, securityScore),
      taggedBugs,
    };
  }

  private scoreBugReportQuality(
    bugReports: {
      stepsToReproduce: string;
      severity: string;
      priority: string;
      evidence: string | null;
    }[]
  ): number {
    if (bugReports.length === 0) return 0;

    let totalPts = 0;
    const maxPerBug = 4;

    for (const br of bugReports) {
      let pts = 0;
      if (br.stepsToReproduce.length > 20) pts++;
      if (br.severity) pts++;
      if (br.priority) pts++;
      if (br.evidence && br.evidence.length > 5) pts++;
      totalPts += pts;
    }

    const avg = totalPts / bugReports.length;
    return Math.min(20, Math.round((avg / maxPerBug) * 20));
  }

  private scoreSummary(summary?: string): number {
    if (!summary || summary.length < 50) return 0;
    if (summary.length < 100) return 3;

    const keywords = [
      'api',
      'endpoint',
      'bug',
      'seguridad',
      'security',
      'autenticación',
      'authorization',
      'validación',
      'validation',
    ];
    const lower = summary.toLowerCase();
    const kwHits = keywords.filter((kw) => lower.includes(kw)).length;

    return Math.min(10, 5 + Math.min(5, kwHits));
  }

  private buildFeedback(params: {
    testDesignScore: number;
    apiValidationScore: number;
    securityScore: number;
    bugReportingScore: number;
    executiveSummaryScore: number;
    totalScore: number;
    passed: boolean;
    bugsFound: number;
  }): string {
    const lines: string[] = [];

    lines.push(
      params.passed
        ? `¡Felicitaciones! Aprobaste el challenge con ${params.totalScore.toFixed(1)}/100 puntos.`
        : `No alcanzaste el umbral de aprobación (${PASS_THRESHOLD} puntos). Obtuviste ${params.totalScore.toFixed(1)}/100.`
    );

    lines.push(
      `Bugs encontrados: ${params.bugsFound}/${Object.keys(BUG_TAGS).length}.`
    );

    if (params.testDesignScore < 15) {
      lines.push(
        'Diseño de casos: intenta cubrir los 5 tipos (positivo, negativo, borde, seguridad, contrato) con al menos 5 casos en total.'
      );
    }
    if (params.securityScore < 10) {
      lines.push(
        'Seguridad: asegúrate de verificar controles de autorización (IDOR) y exposición de datos sensibles.'
      );
    }
    if (params.bugReportingScore < 12) {
      lines.push(
        'Reporte de bugs: incluye pasos de reproducción detallados y evidencia (request/response) en cada bug.'
      );
    }
    if (params.executiveSummaryScore < 6) {
      lines.push(
        'Resumen ejecutivo: incluye al menos 100 caracteres describiendo hallazgos clave, riesgos y recomendaciones.'
      );
    }

    return lines.join(' ');
  }
}
