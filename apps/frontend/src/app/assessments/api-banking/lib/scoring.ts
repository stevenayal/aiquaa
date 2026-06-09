import type { TestCase, BugReport } from '../types';

type ScoreCategory = 'apiValidation' | 'security' | 'bugReporting';

// ---------------------------------------------------------------
// Scoring engine — pure function, no side effects
// ---------------------------------------------------------------

export interface ScoreResult {
  testDesignScore: number;
  apiValidationScore: number;
  securityScore: number;
  bugReportingScore: number;
  executiveSummaryScore: number;
  totalScore: number;
  bugsFound: number;
  bugsTotal: number;
  feedback: string;
  bugTagsFound: string[];
}

interface BugDefinition {
  keywords: string[];
  maxPts: number;
  category: ScoreCategory;
}

const BUG_DEFINITIONS: Record<string, BugDefinition> = {
  'broken-authz-account': {
    keywords: [
      'acc_002',
      'authorization',
      'ownership',
      'idor',
      'autorización',
      'cuenta ajena',
      'otro usuario',
    ],
    maxPts: 5,
    category: 'security',
  },
  'zero-amount': {
    keywords: [
      'monto 0',
      'amount 0',
      'zero',
      'cero',
      'amount zero',
      'monto cero',
    ],
    maxPts: 3,
    category: 'apiValidation',
  },
  'negative-amount': {
    keywords: [
      'negativo',
      'negative',
      'monto negativo',
      'amount negative',
      '-100',
    ],
    maxPts: 3,
    category: 'apiValidation',
  },
  'wrong-status-code': {
    keywords: [
      '200',
      '400',
      'status code',
      'código de estado',
      'status incorrecto',
      'devuelve 200',
    ],
    maxPts: 4,
    category: 'apiValidation',
  },
  'insufficient-balance': {
    keywords: [
      'saldo insuficiente',
      'insufficient balance',
      'saldo',
      'balance',
      'fondos',
    ],
    maxPts: 4,
    category: 'apiValidation',
  },
  'sensitive-data': {
    keywords: [
      'internalriskscore',
      'risk score',
      'riesgo',
      'dato sensible',
      'sensitive',
      'campo interno',
    ],
    maxPts: 5,
    category: 'security',
  },
  'transfer-ownership': {
    keywords: [
      'transfer',
      'transferencia ajena',
      'ownership',
      'otro usuario',
      'transferid',
      'no es dueño',
    ],
    maxPts: 5,
    category: 'security',
  },
  'openapi-mismatch': {
    keywords: [
      'availablebalance',
      'balance',
      'contrato',
      'openapi',
      'mismatch',
      'inconsistencia',
      'campo distinto',
    ],
    maxPts: 4,
    category: 'apiValidation',
  },
  'long-description': {
    keywords: [
      '120',
      'descripción larga',
      'long description',
      'caracteres',
      'maxlength',
      'max length',
    ],
    maxPts: 2,
    category: 'apiValidation',
  },
  'expired-token': {
    keywords: [
      'expirado',
      'expired',
      'exp',
      'token vencido',
      'token expirado',
      'acepta token',
    ],
    maxPts: 4,
    category: 'security',
  },
  'missing-idempotency': {
    keywords: [
      'idempotency',
      'idempotente',
      'duplicado',
      'duplicate',
      'doble envío',
      'idempotencykey',
    ],
    maxPts: 4,
    category: 'apiValidation',
  },
  'ambiguous-errors': {
    keywords: [
      'mensaje ambiguo',
      'error genérico',
      'ambiguous',
      'vago',
      'mensaje vago',
      'error message',
    ],
    maxPts: 2,
    category: 'bugReporting',
  },
};

const MAX_SCORES = {
  testDesign: 25,
  apiValidation: 25,
  security: 20,
  bugReporting: 20,
  executiveSummary: 10,
};

function matchesBugKeywords(report: BugReport, keywords: string[]): boolean {
  const text = [
    report.title,
    report.description ?? '',
    report.stepsToReproduce,
    report.actualResult,
    report.expectedResult,
    report.endpoint,
    report.evidence ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

function scoreTestDesign(testCases: TestCase[]): number {
  if (testCases.length === 0) return 0;

  const distinctTypes = new Set(testCases.map((tc) => tc.type));
  const typeVarietyScore = Math.min(distinctTypes.size * 5, 25);

  // Bonus points for complete test cases (all fields filled)
  const completeCount = testCases.filter(
    (tc) => tc.steps.trim().length > 0 && tc.expectedResult.trim().length > 0
  ).length;
  const completenessBonus = Math.min(completeCount * 0.5, 5);

  return Math.min(typeVarietyScore + completenessBonus, MAX_SCORES.testDesign);
}

function scoreBugReporting(bugReports: BugReport[]): number {
  if (bugReports.length === 0) return 0;

  let score = 0;
  for (const report of bugReports) {
    if (
      report.stepsToReproduce.trim() &&
      report.actualResult.trim() &&
      report.expectedResult.trim()
    ) {
      score += 2;
    }
    if (report.severity && report.priority) score += 1;
    if (report.evidence?.trim()) score += 1;
  }

  return Math.min(score, MAX_SCORES.bugReporting);
}

function scoreExecutiveSummary(summary?: string): number {
  if (!summary || summary.trim().length < 50) return 0;

  const text = summary.toLowerCase();
  const keywordHits = [
    'bug',
    'falla',
    'vulnerabilidad',
    'riesgo',
    'autorización',
    'token',
    'contrato',
    'seguridad',
    'transferencia',
    'saldo',
    'recomendación',
  ].filter((kw) => text.includes(kw)).length;

  if (summary.length >= 300 && keywordHits >= 3) return 10;
  if (summary.length >= 150 && keywordHits >= 2) return 7;
  if (summary.length >= 100) return 5;
  return 2;
}

export function autoScore(
  testCases: TestCase[],
  bugReports: BugReport[],
  summary?: string
): ScoreResult {
  const bugTagsFound: string[] = [];
  let apiValidationScore = 0;
  let securityScore = 0;

  for (const [tag, def] of Object.entries(BUG_DEFINITIONS)) {
    const matched = bugReports.some((r) => matchesBugKeywords(r, def.keywords));
    if (matched) {
      bugTagsFound.push(tag);
      if (def.category === 'apiValidation') apiValidationScore += def.maxPts;
      else if (def.category === 'security') securityScore += def.maxPts;
    }
  }

  apiValidationScore = Math.min(apiValidationScore, MAX_SCORES.apiValidation);
  securityScore = Math.min(securityScore, MAX_SCORES.security);

  const testDesignScore = scoreTestDesign(testCases);
  const bugReportingScore = scoreBugReporting(bugReports);
  const executiveSummaryScore = scoreExecutiveSummary(summary);

  const totalScore =
    testDesignScore +
    apiValidationScore +
    securityScore +
    bugReportingScore +
    executiveSummaryScore;

  const bugsFound = bugTagsFound.length;
  const bugsTotal = Object.keys(BUG_DEFINITIONS).length;

  const feedback = buildFeedback(
    totalScore,
    bugsFound,
    bugsTotal,
    bugTagsFound
  );

  return {
    testDesignScore,
    apiValidationScore,
    securityScore,
    bugReportingScore,
    executiveSummaryScore,
    totalScore: Math.round(totalScore * 100) / 100,
    bugsFound,
    bugsTotal,
    feedback,
    bugTagsFound,
  };
}

function buildFeedback(
  total: number,
  bugsFound: number,
  bugsTotal: number,
  tags: string[]
): string {
  const parts: string[] = [];

  if (total >= 85) {
    parts.push(
      'Excelente trabajo. Demostrás un nivel semi-senior sólido en API Testing.'
    );
  } else if (total >= 60) {
    parts.push('Buen desempeño. Encontraste los puntos más importantes.');
  } else {
    parts.push(
      'Hay oportunidades de mejora. Revisá la sección de seguridad y contratos.'
    );
  }

  parts.push(`Bugs encontrados: ${bugsFound}/${bugsTotal}.`);

  const missedSecurity = [
    'broken-authz-account',
    'sensitive-data',
    'transfer-ownership',
    'expired-token',
  ].filter((t) => !tags.includes(t));
  if (missedSecurity.length > 0) {
    parts.push(`Te faltaron bugs de seguridad: ${missedSecurity.join(', ')}.`);
  }

  const missedContract = ['openapi-mismatch'].filter((t) => !tags.includes(t));
  if (missedContract.length > 0) {
    parts.push(
      'No detectaste la inconsistencia en el contrato OpenAPI (availableBalance vs balance).'
    );
  }

  return parts.join(' ');
}

export const RUBRIC_THRESHOLDS = {
  excellent: 0.9,
  acceptable: 0.6,
};

export const SCORE_MAX = MAX_SCORES;
export const ALL_BUG_TAGS = Object.keys(BUG_DEFINITIONS);
