import type { TestCase, BugReport } from '../types';
import {
  API_CHALLENGE_MIN_FINDINGS,
  API_CHALLENGE_MIN_SUMMARY_CHARS,
  API_CHALLENGE_MIN_TEST_CASES,
} from '../data/apiChallengeTargets';
import { API_CHALLENGE_EVALUATION_CRITERIA } from '../data/evaluationCriteria';

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

const MAX_SCORES = {
  testDesign: API_CHALLENGE_EVALUATION_CRITERIA[0].maxScore,
  apiValidation: API_CHALLENGE_EVALUATION_CRITERIA[1].maxScore,
  security: API_CHALLENGE_EVALUATION_CRITERIA[2].maxScore,
  bugReporting: API_CHALLENGE_EVALUATION_CRITERIA[3].maxScore,
  executiveSummary: API_CHALLENGE_EVALUATION_CRITERIA[4].maxScore,
};

export const RUBRIC_CATEGORIES = API_CHALLENGE_EVALUATION_CRITERIA.map(
  (criterion) => ({
    key: criterion.key,
    label: criterion.label,
    max: criterion.maxScore,
  })
);

const HTTP_OR_REPRO_KEYWORDS = [
  'get ',
  'post ',
  'http',
  'https://',
  'curl',
  'status',
  'codigo',
  'body',
  'json',
  'query',
  'param',
  'header',
];

const CONTRACT_DATA_KEYWORDS = [
  'schema',
  'contrato',
  'campo',
  'tipo',
  'required',
  'obligatorio',
  'status code',
  'paginacion',
  'pagination',
  'filtro',
  'filter',
  'array',
  'objeto',
  'null',
  '404',
  '400',
  'rate',
  'fecha',
];

const SUMMARY_KEYWORDS = [
  'cobertura',
  'hallazgo',
  'riesgo',
  'recomendacion',
  'evidencia',
  'contrato',
  'datos',
  'status',
  'api',
  'limitacion',
];

function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}

function normalize(text: string | undefined | null): string {
  return (text ?? '').toLowerCase();
}

function textHasAny(text: string, keywords: string[]): boolean {
  const normalized = normalize(text);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function joinedTestCaseText(testCase: TestCase): string {
  return [
    testCase.title,
    testCase.preconditions ?? '',
    testCase.steps,
    testCase.expectedResult,
    testCase.type,
    testCase.priority,
  ].join(' ');
}

function joinedReportText(report: BugReport): string {
  return [
    report.title,
    report.description ?? '',
    report.stepsToReproduce,
    report.actualResult,
    report.expectedResult,
    report.endpoint,
    report.evidence ?? '',
    report.severity,
    report.priority,
  ].join(' ');
}

function completionRatio(items: number, target: number): number {
  return target <= 0 ? 1 : clamp(items / target, 1);
}

function scoreTestDesign(testCases: TestCase[]): number {
  if (testCases.length === 0) return 0;

  const quantity = completionRatio(
    testCases.length,
    API_CHALLENGE_MIN_TEST_CASES
  );
  const distinctTypes = new Set(testCases.map((tc) => tc.type));
  const variety = completionRatio(distinctTypes.size, 5);
  const complete = completionRatio(
    testCases.filter(
      (tc) =>
        tc.title.trim().length >= 8 &&
        tc.steps.trim().length >= 25 &&
        tc.expectedResult.trim().length >= 20
    ).length,
    API_CHALLENGE_MIN_TEST_CASES
  );
  const reproducible = completionRatio(
    testCases.filter((tc) =>
      textHasAny(joinedTestCaseText(tc), HTTP_OR_REPRO_KEYWORDS)
    ).length,
    Math.max(3, Math.ceil(API_CHALLENGE_MIN_TEST_CASES / 2))
  );

  return clamp(
    quantity * 8 + variety * 8 + complete * 8 + reproducible * 6,
    MAX_SCORES.testDesign
  );
}

function scoreExecutionEvidence(
  testCases: TestCase[],
  bugReports: BugReport[]
): number {
  if (testCases.length === 0 && bugReports.length === 0) return 0;

  const testEvidence = completionRatio(
    testCases.filter((tc) =>
      textHasAny(joinedTestCaseText(tc), HTTP_OR_REPRO_KEYWORDS)
    ).length,
    API_CHALLENGE_MIN_TEST_CASES
  );
  const reportEvidence = completionRatio(
    bugReports.filter(
      (report) =>
        textHasAny(joinedReportText(report), HTTP_OR_REPRO_KEYWORDS) &&
        (report.evidence?.trim().length ?? 0) >= 10
    ).length,
    API_CHALLENGE_MIN_FINDINGS
  );
  const endpointCoverage = completionRatio(
    new Set(
      bugReports
        .map((report) => report.endpoint.trim())
        .filter((endpoint) => endpoint.length > 0)
    ).size,
    API_CHALLENGE_MIN_FINDINGS
  );

  return clamp(
    testEvidence * 9 + reportEvidence * 11 + endpointCoverage * 5,
    MAX_SCORES.apiValidation
  );
}

function scoreContractAndData(
  testCases: TestCase[],
  bugReports: BugReport[]
): number {
  const allTexts = [
    ...testCases.map(joinedTestCaseText),
    ...bugReports.map(joinedReportText),
  ];
  if (allTexts.length === 0) return 0;

  const contractCases = completionRatio(
    testCases.filter(
      (tc) =>
        tc.type === 'contract' ||
        tc.type === 'boundary' ||
        textHasAny(joinedTestCaseText(tc), CONTRACT_DATA_KEYWORDS)
    ).length,
    3
  );
  const contractReports = completionRatio(
    bugReports.filter((report) =>
      textHasAny(joinedReportText(report), CONTRACT_DATA_KEYWORDS)
    ).length,
    API_CHALLENGE_MIN_FINDINGS
  );
  const keywordBreadth = completionRatio(
    CONTRACT_DATA_KEYWORDS.filter((keyword) =>
      allTexts.some((text) => normalize(text).includes(keyword))
    ).length,
    6
  );

  return clamp(
    contractCases * 7 + contractReports * 7 + keywordBreadth * 6,
    MAX_SCORES.security
  );
}

function scoreBugReporting(bugReports: BugReport[]): number {
  if (bugReports.length === 0) return 0;

  const quantity = completionRatio(
    bugReports.length,
    API_CHALLENGE_MIN_FINDINGS
  );
  const complete = completionRatio(
    bugReports.filter(
      (report) =>
        report.title.trim().length >= 8 &&
        report.stepsToReproduce.trim().length >= 25 &&
        report.actualResult.trim().length >= 15 &&
        report.expectedResult.trim().length >= 15
    ).length,
    API_CHALLENGE_MIN_FINDINGS
  );
  const classified = completionRatio(
    bugReports.filter((report) => report.severity && report.priority).length,
    API_CHALLENGE_MIN_FINDINGS
  );
  const impact = completionRatio(
    bugReports.filter((report) =>
      textHasAny(joinedReportText(report), [
        'impacto',
        'riesgo',
        'usuario',
        'negocio',
        'seguridad',
        'limite',
        'limitacion',
        'mejora',
      ])
    ).length,
    API_CHALLENGE_MIN_FINDINGS
  );

  return clamp(
    quantity * 3 + complete * 6 + classified * 3 + impact * 3,
    MAX_SCORES.bugReporting
  );
}

function scoreExecutiveSummary(summary?: string): number {
  const trimmed = summary?.trim() ?? '';
  if (trimmed.length < 50) return 0;

  const lengthScore =
    completionRatio(trimmed.length, API_CHALLENGE_MIN_SUMMARY_CHARS) * 4;
  const keywordScore =
    completionRatio(
      SUMMARY_KEYWORDS.filter((keyword) => normalize(trimmed).includes(keyword))
        .length,
      5
    ) * 4;
  const structureScore = /riesgo|recomendacion|hallazgo/i.test(trimmed) ? 2 : 0;

  return clamp(lengthScore + keywordScore + structureScore, 10);
}

export function autoScore(
  testCases: TestCase[],
  bugReports: BugReport[],
  summary?: string
): ScoreResult {
  const testDesignScore = scoreTestDesign(testCases);
  const apiValidationScore = scoreExecutionEvidence(testCases, bugReports);
  const securityScore = scoreContractAndData(testCases, bugReports);
  const bugReportingScore = scoreBugReporting(bugReports);
  const executiveSummaryScore = scoreExecutiveSummary(summary);

  const totalScore =
    testDesignScore +
    apiValidationScore +
    securityScore +
    bugReportingScore +
    executiveSummaryScore;

  const bugsFound = Math.min(bugReports.length, API_CHALLENGE_MIN_FINDINGS);
  const bugsTotal = API_CHALLENGE_MIN_FINDINGS;
  const roundedTotal = Math.round(totalScore * 100) / 100;

  return {
    testDesignScore: Math.round(testDesignScore * 100) / 100,
    apiValidationScore: Math.round(apiValidationScore * 100) / 100,
    securityScore: Math.round(securityScore * 100) / 100,
    bugReportingScore: Math.round(bugReportingScore * 100) / 100,
    executiveSummaryScore: Math.round(executiveSummaryScore * 100) / 100,
    totalScore: roundedTotal,
    bugsFound,
    bugsTotal,
    feedback: buildFeedback(roundedTotal, {
      testCasesCount: testCases.length,
      findingsCount: bugReports.length,
      summaryLength: summary?.trim().length ?? 0,
      testDesignScore,
      apiValidationScore,
      securityScore,
      bugReportingScore,
      executiveSummaryScore,
    }),
    bugTagsFound: [],
  };
}

function buildFeedback(
  total: number,
  context: {
    testCasesCount: number;
    findingsCount: number;
    summaryLength: number;
    testDesignScore: number;
    apiValidationScore: number;
    securityScore: number;
    bugReportingScore: number;
    executiveSummaryScore: number;
  }
): string {
  const parts: string[] = [];

  if (total >= 85) {
    parts.push(
      'Excelente trabajo: la entrega combina cobertura, evidencia y criterio QA replicable.'
    );
  } else if (total >= 60) {
    parts.push(
      'Buen desempeno: la entrega es evaluable, con oportunidades de fortalecer evidencia o analisis.'
    );
  } else {
    parts.push(
      'Hay oportunidades de mejora: prioriza requests reproducibles, cobertura variada y hallazgos mejor sustentados.'
    );
  }

  if (context.testCasesCount < API_CHALLENGE_MIN_TEST_CASES) {
    parts.push(
      `Faltan casos de prueba: ${context.testCasesCount}/${API_CHALLENGE_MIN_TEST_CASES}.`
    );
  }
  if (context.findingsCount < API_CHALLENGE_MIN_FINDINGS) {
    parts.push(
      `Faltan hallazgos: ${context.findingsCount}/${API_CHALLENGE_MIN_FINDINGS}.`
    );
  }
  if (context.summaryLength < API_CHALLENGE_MIN_SUMMARY_CHARS) {
    parts.push(
      `El resumen ejecutivo debe llegar a ${API_CHALLENGE_MIN_SUMMARY_CHARS} caracteres.`
    );
  }
  if (context.apiValidationScore < MAX_SCORES.apiValidation * 0.6) {
    parts.push('Agrega mas evidencia: URL, status code, body y datos usados.');
  }
  if (context.securityScore < MAX_SCORES.security * 0.6) {
    parts.push(
      'Refuerza contrato y datos: schema, campos obligatorios, tipos, errores, filtros o paginacion.'
    );
  }
  if (context.bugReportingScore < MAX_SCORES.bugReporting * 0.6) {
    parts.push(
      'Mejora los reportes con pasos claros, resultado actual, esperado, impacto y prioridad.'
    );
  }

  return parts.join(' ');
}

export const RUBRIC_THRESHOLDS = {
  excellent: 0.9,
  acceptable: 0.6,
};

export const SCORE_MAX = MAX_SCORES;
