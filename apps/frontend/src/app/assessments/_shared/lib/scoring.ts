import type {
  AssessmentFeedback,
  AssessmentQuestion,
  AssessmentSection,
  AssessmentSectionScore,
  CandidateBand,
  CandidateLevel,
  ResponseAnalysisScenario,
} from '../types';

type ScoreResult = {
  score: number;
  isCorrect: boolean;
  feedback: string;
};

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
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

/** Respuesta del candidato para `multiple_select`: `{ values: string[] }`. */
function parseValuesAnswer(answer: unknown): string[] {
  const raw = Array.isArray(answer)
    ? answer
    : answer && typeof answer === 'object' && 'values' in answer
      ? ((answer as { values?: unknown }).values ?? [])
      : [];
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(
      raw
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

// Crédito parcial con penalización por opción de más: cada distractor marcado
// cancela un acierto. Marcar las 4 opciones de una pregunta con 3 correctas da
// 0, no puntaje casi completo.
function scoreMultipleSelect(
  question: AssessmentQuestion,
  answer: unknown
): ScoreResult {
  const correct = Array.isArray(
    (question.correct_answer as { values?: unknown } | undefined)?.values
  )
    ? ((question.correct_answer as { values: string[] }).values ?? [])
    : [];

  if (correct.length === 0) {
    return {
      score: 0,
      isCorrect: false,
      feedback: 'La pregunta no tiene respuestas correctas configuradas.',
    };
  }

  const picked = parseValuesAnswer(answer);

  if (picked.length === 0) {
    return {
      score: 0,
      isCorrect: false,
      feedback: 'No seleccionaste ninguna opción.',
    };
  }

  const hits = picked.filter((value) => correct.includes(value)).length;
  const extras = picked.length - hits;
  const net = Math.max(0, hits - extras);
  const score = Math.round((question.points * net) / correct.length);
  const isCorrect = hits === correct.length && extras === 0;

  if (isCorrect) {
    return {
      score: question.points,
      isCorrect: true,
      feedback: 'Seleccionaste exactamente las opciones correctas.',
    };
  }

  if (extras > 0 && hits < correct.length) {
    return {
      score,
      isCorrect: false,
      feedback:
        'Faltan opciones correctas y además marcaste alguna que no corresponde.',
    };
  }

  if (extras > 0) {
    return {
      score,
      isCorrect: false,
      feedback:
        'Identificaste las opciones correctas, pero marcaste además alguna que no corresponde.',
    };
  }

  return {
    score,
    isCorrect: false,
    feedback: 'La selección es parcial: faltan opciones correctas.',
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

export function scoreAssessmentQuestion(
  question: AssessmentQuestion,
  answer: unknown
): ScoreResult {
  switch (question.question_type) {
    case 'multiple_choice':
    case 'true_false':
    case 'doc_analysis':
      return compareSimpleAnswer(question, answer);
    case 'multiple_select':
      return scoreMultipleSelect(question, answer);
    case 'short_text':
      return scoreShortText(question, answer);
    case 'response_analysis':
      return scoreResponseAnalysis(question, answer);
    default:
      return {
        score: 0,
        isCorrect: false,
        feedback: 'Tipo de pregunta no soportado.',
      };
  }
}

export function deriveCandidateLevel(
  totalScore: number,
  bands?: CandidateBand[]
): CandidateLevel {
  if (bands && bands.length > 0) {
    const band = bands.find(
      (item) => totalScore >= item.min && totalScore <= item.max
    );
    if (band) return band.label as CandidateLevel;
  }

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
