import type {
  AssessmentFeedback,
  AssessmentQuestion,
  AssessmentSection,
  AssessmentSectionScore,
  BugReportDraft,
  CandidateLevel,
  ResponseAnalysisScenario,
  TestCaseDraft,
} from '../types';

type ScoreResult = {
  score: number;
  isCorrect: boolean;
  feedback: string;
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .replace(/[^\w\s/-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function countKeywordMatches(text: string, keywords: string[]) {
  const normalized = normalizeText(text);
  return keywords.filter((keyword) =>
    normalized.includes(normalizeText(keyword))
  ).length;
}

function parseStringAnswer(answer: unknown) {
  if (typeof answer === 'string') return answer;
  if (answer && typeof answer === 'object' && 'value' in answer) {
    const value = (answer as { value?: unknown }).value;
    return typeof value === 'string' ? value : '';
  }
  return '';
}

function parseBooleanAnswer(answer: unknown) {
  if (typeof answer === 'boolean') return answer;
  if (answer && typeof answer === 'object' && 'value' in answer) {
    return Boolean((answer as { value?: unknown }).value);
  }
  return false;
}

function compareSimpleAnswer(
  question: AssessmentQuestion,
  answer: unknown
): ScoreResult {
  const correctAnswer = (question.correct_answer ?? {}) as
    | { value?: string | boolean; values?: string[] }
    | undefined;

  if (question.question_type === 'true_false') {
    const isCorrect =
      parseBooleanAnswer(answer) === Boolean(correctAnswer?.value);
    return {
      score: isCorrect ? question.points : 0,
      isCorrect,
      feedback: isCorrect
        ? 'Interpretación correcta.'
        : 'La respuesta no coincide con el concepto esperado.',
    };
  }

  if (correctAnswer?.values && correctAnswer.values.length > 0) {
    const answerText = Array.isArray(answer)
      ? answer.join(' ')
      : typeof answer === 'object' && answer && 'value' in (answer as object)
        ? String((answer as { value?: unknown }).value ?? '')
        : String(answer ?? '');
    const matched = countKeywordMatches(answerText, correctAnswer.values);
    const ratio = matched / correctAnswer.values.length;
    const score = Math.round(question.points * ratio);
    return {
      score,
      isCorrect: ratio >= 0.8,
      feedback:
        ratio >= 0.8
          ? 'Identificaste correctamente los campos o elementos esperados.'
          : 'Faltan elementos clave de la documentación o de la respuesta esperada.',
    };
  }

  const actual = normalizeText(parseStringAnswer(answer));
  const expected = normalizeText(String(correctAnswer?.value ?? ''));
  const exactMatch = actual === expected;

  if (exactMatch) {
    return {
      score: question.points,
      isCorrect: true,
      feedback: 'Respuesta correcta.',
    };
  }

  const keywords = question.expected_keywords ?? [];
  if (keywords.length > 0) {
    const matches = countKeywordMatches(actual, keywords);
    const ratio = matches / keywords.length;
    return {
      score: Math.round(question.points * Math.min(1, ratio)),
      isCorrect: ratio >= 0.75,
      feedback:
        ratio >= 0.75
          ? 'La idea principal es correcta.'
          : 'La respuesta necesita más precisión o detalle.',
    };
  }

  return {
    score: 0,
    isCorrect: false,
    feedback: 'La respuesta no coincide con lo esperado.',
  };
}

function scoreShortText(
  question: AssessmentQuestion,
  answer: unknown
): ScoreResult {
  const answerText = parseStringAnswer(answer);
  const keywords = question.expected_keywords ?? [];

  if (!answerText.trim()) {
    return {
      score: 0,
      isCorrect: false,
      feedback: 'La respuesta quedó vacía.',
    };
  }

  if (keywords.length === 0) {
    const exact = compareSimpleAnswer(question, answer);
    return exact;
  }

  const matches = countKeywordMatches(answerText, keywords);
  const ratio = matches / keywords.length;
  const score = Math.min(
    question.points,
    Math.max(0, Math.round(question.points * ratio))
  );

  return {
    score,
    isCorrect: ratio >= 0.6,
    feedback:
      ratio >= 0.8
        ? 'La explicación cubre bien la idea principal.'
        : 'La respuesta es parcialmente correcta, pero faltan conceptos clave.',
  };
}

function scoreResponseAnalysis(
  question: AssessmentQuestion,
  answer: unknown
): ScoreResult {
  const scenario = question.metadata?.scenario as
    | ResponseAnalysisScenario
    | undefined;
  const payload = (answer ?? {}) as { verdict?: string; reason?: string };

  if (!scenario) {
    return { score: 0, isCorrect: false, feedback: 'Escenario inválido.' };
  }

  const verdictOk =
    normalizeText(payload.verdict ?? '') === scenario.expectedVerdict;
  const reason = payload.reason ?? '';
  const expectedReason = scenario.expectedBugReason ?? '';

  if (!verdictOk) {
    return {
      score: 0,
      isCorrect: false,
      feedback: 'La clasificación correcto/bug no coincide con el escenario.',
    };
  }

  if (scenario.expectedVerdict === 'correct') {
    return {
      score: question.points,
      isCorrect: true,
      feedback: 'Clasificaste correctamente una respuesta válida.',
    };
  }

  const keywords = tokenize(expectedReason);
  const reasonMatches = countKeywordMatches(reason, keywords);
  const ratio = keywords.length > 0 ? reasonMatches / keywords.length : 1;

  return {
    score: ratio >= 0.35 ? question.points : Math.max(1, question.points - 1),
    isCorrect: true,
    feedback:
      ratio >= 0.35
        ? 'Detectaste el bug y explicaste correctamente el motivo.'
        : 'Detectaste el bug, pero la explicación necesita más precisión.',
  };
}

function getEndpointRules(method: string) {
  switch (method.toUpperCase()) {
    case 'GET':
      return ['401', '404', 'contrato', 'id', 'respuesta'];
    case 'POST':
      return [
        'name',
        'price',
        'stock',
        'active',
        'duplicado',
        '401',
        'contrato',
      ];
    case 'PUT':
      return ['price', 'stock', 'active', '401', '404', 'contrato'];
    case 'DELETE':
      return ['401', '403', '404', 'admin', 'autorizacion'];
    default:
      return [];
  }
}

function scoreTestCases(
  question: AssessmentQuestion,
  answer: unknown
): ScoreResult {
  const cases = Array.isArray(answer) ? (answer as TestCaseDraft[]) : [];
  const minimumCases = Number(question.metadata?.minimumCases ?? 4);
  const recommendedTypes =
    (question.metadata?.recommendedTypes as string[] | undefined) ?? [];
  const endpointRules = getEndpointRules(
    String(question.metadata?.method ?? '')
  );
  const feedback: string[] = [];

  if (cases.length === 0) {
    return {
      score: 0,
      isCorrect: false,
      feedback: 'No se cargaron casos de prueba para esta consigna.',
    };
  }

  const completeCases = cases.filter((testCase) =>
    [
      testCase.title,
      testCase.endpoint,
      testCase.method,
      testCase.preconditions,
      testCase.input,
      testCase.steps,
      testCase.expectedResult,
      testCase.caseType,
      testCase.priority,
    ].every((field) => String(field ?? '').trim().length > 0)
  ).length;

  const uniqueTypes = new Set(
    cases.map((testCase) => normalizeText(testCase.caseType ?? ''))
  );
  const recommendedCoverage = recommendedTypes.filter((type) =>
    uniqueTypes.has(normalizeText(type))
  ).length;

  const combinedText = cases
    .map((testCase) =>
      [
        testCase.title,
        testCase.preconditions,
        testCase.input,
        testCase.steps,
        testCase.expectedResult,
      ].join(' ')
    )
    .join(' ');
  const ruleMatches = countKeywordMatches(combinedText, endpointRules);

  const coverageRatio = recommendedTypes.length
    ? recommendedCoverage / recommendedTypes.length
    : 1;
  const completenessRatio =
    completeCases / Math.max(cases.length, minimumCases);
  const rulesRatio = endpointRules.length
    ? ruleMatches / endpointRules.length
    : 1;
  const countRatio = Math.min(1, cases.length / minimumCases);

  const weightedRatio =
    countRatio * 0.2 +
    completenessRatio * 0.3 +
    coverageRatio * 0.3 +
    rulesRatio * 0.2;
  const score = Math.max(
    0,
    Math.min(question.points, Math.round(question.points * weightedRatio))
  );

  if (cases.length < minimumCases) {
    feedback.push(
      `Se esperaban al menos ${minimumCases} casos y cargaste ${cases.length}.`
    );
  }
  if (coverageRatio < 0.7) {
    feedback.push(
      'Falta cobertura de tipos de caso clave (positivo, negativo, borde, seguridad o contrato).'
    );
  }
  if (completenessRatio < 0.8) {
    feedback.push(
      'Varios casos están incompletos o sin resultado esperado claro.'
    );
  }
  if (rulesRatio < 0.6) {
    feedback.push(
      'No se reflejan suficientes reglas de negocio o validaciones relevantes.'
    );
  }

  return {
    score,
    isCorrect: score >= Math.ceil(question.points * 0.6),
    feedback:
      feedback.length > 0
        ? feedback.join(' ')
        : 'Los casos cubren bien la documentación y las reglas principales.',
  };
}

function scoreBugReport(
  question: AssessmentQuestion,
  answer: unknown
): ScoreResult {
  const bug = (answer ?? {}) as BugReportDraft;
  const endpoint = String(question.metadata?.endpoint ?? '');
  const method = String(question.metadata?.method ?? '');
  const expectedStatus = String(question.metadata?.expectedStatus ?? '');
  const actualStatus = String(question.metadata?.actualStatus ?? '');
  const requiredFields = [
    bug.title,
    bug.endpoint,
    bug.method,
    bug.description,
    bug.stepsToReproduce,
    bug.actualResult,
    bug.expectedResult,
    bug.severity,
    bug.priority,
    bug.evidence,
    bug.environment,
  ];

  const completedRequired = requiredFields.filter(
    (field) => String(field ?? '').trim().length > 0
  ).length;
  const completenessRatio = completedRequired / requiredFields.length;
  const endpointOk =
    normalizeText(bug.endpoint ?? '') === normalizeText(endpoint) &&
    normalizeText(bug.method ?? '') === normalizeText(method);
  const expectedOk =
    normalizeText(bug.expectedResult ?? '').includes(expectedStatus) ||
    normalizeText(bug.expectedResult ?? '').includes('forbidden') ||
    normalizeText(bug.expectedResult ?? '').includes('unauthorized') ||
    normalizeText(bug.expectedResult ?? '').includes('bad request') ||
    normalizeText(bug.expectedResult ?? '').includes('not found');
  const actualOk = normalizeText(bug.actualResult ?? '').includes(actualStatus);
  const severityOk = String(bug.severity ?? '').trim().length > 0;
  const priorityOk = String(bug.priority ?? '').trim().length > 0;

  let score = 0;
  if (completenessRatio >= 0.9) score += 2;
  else if (completenessRatio >= 0.7) score += 1;
  if (endpointOk) score += 1;
  if (expectedOk && actualOk) score += 1;
  if (severityOk && priorityOk) score += 1;

  const feedback: string[] = [];
  if (completenessRatio < 0.9) {
    feedback.push(
      'Faltan algunos campos obligatorios o están demasiado vacíos.'
    );
  }
  if (!endpointOk) {
    feedback.push('Endpoint o método no coinciden con el bug de referencia.');
  }
  if (!(expectedOk && actualOk)) {
    feedback.push(
      'El resultado actual o esperado no refleja claramente los status codes esperados.'
    );
  }
  if (!(severityOk && priorityOk)) {
    feedback.push(
      'La severidad y/o prioridad necesitan estar mejor clasificadas.'
    );
  }

  return {
    score: Math.min(question.points, score),
    isCorrect: score >= 3,
    feedback:
      feedback.length > 0
        ? feedback.join(' ')
        : 'Bug report claro, reproducible y bien clasificado.',
  };
}

export function scoreAssessmentQuestion(
  question: AssessmentQuestion,
  answer: unknown
): ScoreResult {
  switch (question.question_type) {
    case 'multiple_choice':
    case 'true_false':
    case 'doc_analysis':
      return compareSimpleAnswer(question, answer);
    case 'short_text':
      return scoreShortText(question, answer);
    case 'response_analysis':
      return scoreResponseAnalysis(question, answer);
    case 'test_case_matrix':
      return scoreTestCases(question, answer);
    case 'bug_report':
      return scoreBugReport(question, answer);
    default:
      return {
        score: 0,
        isCorrect: false,
        feedback: 'Tipo de pregunta no soportado.',
      };
  }
}

export function deriveCandidateLevel(totalScore: number): CandidateLevel {
  if (totalScore <= 39) return 'Inicial';
  if (totalScore <= 59) return 'Junior en formación';
  if (totalScore <= 74) return 'Junior';
  if (totalScore <= 89) return 'Junior avanzado / Semi Senior inicial';
  return 'Semi Senior';
}

function summarizeSectionPerformance(
  section: AssessmentSection,
  score: number
) {
  const ratio = section.max_score > 0 ? score / section.max_score : 0;

  if (ratio >= 0.85) {
    return {
      strength: `${section.title}: demostraste dominio sólido y criterio consistente.`,
      weakness: null,
      recommendation: `Mantené este nivel en ${section.title.toLowerCase()} y avanzá hacia casos más complejos.`,
      message:
        'Excelente desempeño. Interpretaste correctamente la mayoría de los conceptos o escenarios del nivel.',
    };
  }

  if (ratio >= 0.6) {
    return {
      strength: null,
      weakness: `${section.title}: resolviste lo esencial, pero aún hay oportunidades de mayor profundidad.`,
      recommendation: `Reforzá ${section.title.toLowerCase()} con foco en precisión y cobertura de detalles.`,
      message:
        'Desempeño aceptable. Entendés la base, pero algunos detalles clave todavía generan ruido.',
    };
  }

  return {
    strength: null,
    weakness: `${section.title}: se observan brechas relevantes en comprensión, cobertura o precisión.`,
    recommendation: `Volvé a practicar ${section.title.toLowerCase()} con ejemplos guiados y revisión de conceptos base.`,
    message:
      'El nivel quedó por debajo de lo esperado. Conviene reforzar fundamentos antes de pasar a escenarios más avanzados.',
  };
}

export function buildAssessmentFeedback(
  sections: AssessmentSection[],
  sectionScores: AssessmentSectionScore[],
  attemptId: string
): {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  feedbackEntries: Omit<AssessmentFeedback, 'id' | 'created_at'>[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  const feedbackEntries: Omit<AssessmentFeedback, 'id' | 'created_at'>[] = [];

  sections
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .forEach((section, index) => {
      const sectionScore = sectionScores.find(
        (score) => score.section_id === section.id
      );
      const score = sectionScore?.score ?? 0;
      const summary = summarizeSectionPerformance(section, score);

      if (summary.strength) strengths.push(summary.strength);
      if (summary.weakness) weaknesses.push(summary.weakness);
      recommendations.push(summary.recommendation);

      feedbackEntries.push({
        attempt_id: attemptId,
        level: index + 1,
        message: summary.message,
        recommendations: [summary.recommendation],
      });
    });

  return { strengths, weaknesses, recommendations, feedbackEntries };
}
