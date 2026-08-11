// Metadata y helpers de display compartidos por el historial de exámenes
// (perfil y dashboard). Centraliza emojis/labels/href y el formato de puntaje,
// que difiere entre exámenes por preguntas y assessments por puntos.

export type ExamType =
  | 'git'
  | 'git-practico'
  | 'istqb'
  | 'performance'
  | 'test-app'
  | 'api-testing-fundamentals'
  | 'api-banking'
  | 'database-fundamentals'
  | 'database-practice'
  | 'infrastructure-fundamentals'
  | 'api-developer-fundamentals'
  | 'api-dotnet-fundamentals'
  | 'playwright-practico'
  | 'playwright-fundamentals'
  | 'gherkin-fundamentals';

export interface ExamMeta {
  emoji: string;
  label: string;
  href: string;
}

export const EXAM_META: Record<ExamType, ExamMeta> = {
  git: { emoji: '🌿', label: 'Examen GIT', href: '/labs/git' },
  'git-practico': {
    emoji: '🐙',
    label: 'Git — Prueba práctica',
    href: '/labs/git-practico',
  },
  istqb: { emoji: '📋', label: 'ISTQB CTFL v4.0', href: '/labs/istqb' },
  performance: {
    emoji: '⚡',
    label: 'Performance Testing',
    href: '/labs/performance',
  },
  'test-app': {
    emoji: '🧪',
    label: 'Test App',
    href: '/labs/test-app',
  },
  'api-testing-fundamentals': {
    emoji: '🌐',
    label: 'API Testing — Fundamentos',
    href: '/assessments/api-testing-fundamentals',
  },
  'api-banking': {
    emoji: '🏦',
    label: 'API Banking — Challenge práctico',
    href: '/assessments/api-banking',
  },
  'database-fundamentals': {
    emoji: '🗄️',
    label: 'Bases de Datos — Fundamentos',
    href: '/assessments/database-fundamentals',
  },
  'database-practice': {
    emoji: '🧮',
    label: 'Bases de Datos — Práctica SQL',
    href: '/assessments/database-practice',
  },
  'infrastructure-fundamentals': {
    emoji: '🐳',
    label: 'Infraestructura — Fundamentos',
    href: '/assessments/infrastructure-fundamentals',
  },
  'api-developer-fundamentals': {
    emoji: '🔌',
    label: 'APIs para Desarrolladores — Fundamentos',
    href: '/assessments/api-developer-fundamentals',
  },
  'api-dotnet-fundamentals': {
    emoji: '🟣',
    label: 'API .NET — Fundamentos',
    href: '/assessments/api-dotnet-fundamentals',
  },
  'playwright-practico': {
    emoji: '🎭',
    label: 'Playwright — Prueba práctica',
    href: '/labs/playwright-practico',
  },
  'playwright-fundamentals': {
    emoji: '🎬',
    label: 'Playwright — Fundamentos',
    href: '/assessments/playwright-fundamentals',
  },
  'gherkin-fundamentals': {
    emoji: '🥒',
    label: 'Gherkin y BDD — Fundamentos',
    href: '/assessments/gherkin-fundamentals',
  },
};

export const EXAM_TYPES = Object.keys(EXAM_META) as ExamType[];

// Tipos cuyo `score` representa puntos (no respuestas correctas); el total real
// vive en `max_possible_score`, no en `total_questions`.
export const POINTS_BASED_TYPES = new Set<ExamType>([
  'api-testing-fundamentals',
  'api-banking',
  'database-fundamentals',
  'database-practice',
  'infrastructure-fundamentals',
  'api-developer-fundamentals',
  'api-dotnet-fundamentals',
  'playwright-practico',
  'playwright-fundamentals',
  'gherkin-fundamentals',
]);

export interface ExamScoreFields {
  exam_type: string;
  score: number;
  total_questions: number;
  max_possible_score?: number | null;
}

/**
 * Formatea el puntaje de un examen según su tipo:
 * - Assessments por puntos: `${score}/${max_possible_score} pts`.
 * - Exámenes por preguntas (y test-app): `${score}/${total_questions}`.
 */
export function formatExamScore(r: ExamScoreFields): string {
  if (
    POINTS_BASED_TYPES.has(r.exam_type as ExamType) &&
    r.max_possible_score != null
  ) {
    return `${r.score}/${r.max_possible_score} pts`;
  }
  return `${r.score}/${r.total_questions}`;
}
