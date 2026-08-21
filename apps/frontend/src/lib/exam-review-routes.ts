// Ruta de corrección manual según el tipo de examen. Centralizado acá porque
// los paneles de empresa (candidatos, procesos) tenían la condición
// `exam_type === 'test-app'` hardcodeada en tres lugares distintos.

import { DESARROLLO_CHALLENGE_IDS } from '@/lib/labs/desarrolloChallenges';

/** Bug hunt y prácticas con score heurístico: rúbrica por item. */
const RUBRIC_REVIEW_TYPES = new Set<string>(['test-app']);

/** Pruebas de desarrollo: el evaluador carga un puntaje global. */
const DESARROLLO_REVIEW_TYPES = new Set<string>(DESARROLLO_CHALLENGE_IDS);

/**
 * Devuelve el link de corrección para un resultado, o `null` si ese tipo de
 * examen se corrige solo.
 */
export function reviewHrefFor(
  examType: string | null | undefined,
  resultId: string
): string | null {
  if (!examType) return null;
  if (RUBRIC_REVIEW_TYPES.has(examType)) return `/empresa/evaluar/${resultId}`;
  if (DESARROLLO_REVIEW_TYPES.has(examType)) {
    return `/empresa/evaluar-desarrollo/${resultId}`;
  }
  return null;
}

export function isManuallyReviewed(examType: string | null | undefined) {
  return reviewHrefFor(examType, 'x') !== null;
}
