// Agrupado de resultados de un proceso por candidato.
//
// Las pruebas técnicas del registro (`ASSESSMENT_REGISTRY`) se guardan dos
// veces: la fila de `assessment_attempts` y un espejo en `exam_results` con
// `metadata.assessment_attempt_id` (ver `submitAssessmentAttemptAction`). Los
// paneles de empresa leen las dos tablas, así que sin deduplicar cada intento
// aparecía repetido y el contador de postulantes sumaba filas, no personas.

export type CandidateResultRow = {
  id: string;
  user_id?: string | null;
  participant_name: string | null;
  participant_email: string | null;
  exam_type: string;
  percentage: number;
  passed: boolean;
  created_at: string;
};

export type CandidateExamSummary<T extends CandidateResultRow> = {
  examType: string;
  /** Mejor intento (mayor puntaje; a igualdad, el más reciente). */
  best: T;
  /** Todos los intentos, del más viejo al más nuevo. */
  attempts: T[];
};

export type CandidateGroup<T extends CandidateResultRow> = {
  key: string;
  userId: string | null;
  name: string;
  email: string | null;
  exams: CandidateExamSummary<T>[];
  totalAttempts: number;
  examsPassed: number;
  /**
   * Puntaje del proceso: promedio del mejor intento de cada examen requerido
   * (los no rendidos cuentan 0). Sin exámenes requeridos, promedio de los
   * rendidos.
   */
  processScore: number;
  /** Exámenes requeridos que todavía no rindió. */
  pendingExamTypes: string[];
  lastActivityAt: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** `exam_results.metadata.assessment_attempt_id`, si la fila es un espejo. */
export function getMirroredAttemptId(metadata: unknown): string | null {
  const value = asRecord(metadata)?.assessment_attempt_id;
  return typeof value === 'string' && value ? value : null;
}

/**
 * Descarta los `assessment_attempts` que ya tienen su espejo en
 * `exam_results`: la fila de `exam_results` es la que se muestra porque trae
 * nombre/email del participante y `review_status`.
 */
export function dedupeMirroredAttempts<T extends { id: string }>(
  attempts: T[],
  examResults: { metadata?: unknown }[]
): T[] {
  const mirrored = new Set(
    examResults
      .map((row) => getMirroredAttemptId(row.metadata))
      .filter((id): id is string => Boolean(id))
  );
  if (mirrored.size === 0) return attempts;
  return attempts.filter((attempt) => !mirrored.has(attempt.id));
}

function normalize(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

/** Identidad del candidato: cuenta, si no email, si no nombre. */
export function candidateKeyOf(row: CandidateResultRow) {
  if (row.user_id) return `u:${row.user_id}`;
  const email = normalize(row.participant_email);
  if (email) return `e:${email}`;
  const name = normalize(row.participant_name);
  if (name) return `n:${name}`;
  return `r:${row.id}`;
}

const time = (iso: string) => new Date(iso).getTime() || 0;

function isBetter(a: CandidateResultRow, b: CandidateResultRow) {
  if (a.percentage !== b.percentage) return a.percentage > b.percentage;
  return time(a.created_at) > time(b.created_at);
}

function looksLikeEmail(value: string) {
  return value.includes('@');
}

function pickName(rows: CandidateResultRow[]) {
  // Preferir un nombre real (no un email usado como nombre), el más reciente.
  const byRecency = [...rows].sort(
    (a, b) => time(b.created_at) - time(a.created_at)
  );
  const real = byRecency.find(
    (r) => r.participant_name && !looksLikeEmail(r.participant_name)
  );
  return (
    real?.participant_name ||
    byRecency.find((r) => r.participant_name)?.participant_name ||
    byRecency.find((r) => r.participant_email)?.participant_email ||
    'Sin nombre'
  );
}

/**
 * Agrupa intentos por candidato y, dentro de cada uno, por examen.
 * `requiredExamTypes` es el orden de los exámenes del proceso: define el
 * orden de `exams`, el denominador de `processScore` y `pendingExamTypes`.
 */
export function groupResultsByCandidate<T extends CandidateResultRow>(
  rows: T[],
  requiredExamTypes: string[] = []
): CandidateGroup<T>[] {
  const byCandidate = new Map<string, T[]>();
  for (const row of rows) {
    const key = candidateKeyOf(row);
    const list = byCandidate.get(key) ?? [];
    list.push(row);
    byCandidate.set(key, list);
  }

  const order = new Map(requiredExamTypes.map((type, i) => [type, i]));

  return Array.from(byCandidate.entries())
    .map(([key, candidateRows]) => {
      const byExam = new Map<string, T[]>();
      for (const row of candidateRows) {
        const list = byExam.get(row.exam_type) ?? [];
        list.push(row);
        byExam.set(row.exam_type, list);
      }

      const exams: CandidateExamSummary<T>[] = Array.from(byExam.entries())
        .map(([examType, attempts]) => {
          const sorted = [...attempts].sort(
            (a, b) => time(a.created_at) - time(b.created_at)
          );
          const best = sorted.reduce((acc, r) => (isBetter(r, acc) ? r : acc));
          return { examType, best, attempts: sorted };
        })
        .sort((a, b) => {
          const ai = order.get(a.examType) ?? Number.MAX_SAFE_INTEGER;
          const bi = order.get(b.examType) ?? Number.MAX_SAFE_INTEGER;
          if (ai !== bi) return ai - bi;
          return a.examType.localeCompare(b.examType);
        });

      const taken = new Set(exams.map((e) => e.examType));
      const pendingExamTypes = requiredExamTypes.filter((t) => !taken.has(t));

      const scoredExams =
        requiredExamTypes.length > 0
          ? exams.filter((e) => order.has(e.examType))
          : exams;
      const denominator =
        requiredExamTypes.length > 0
          ? requiredExamTypes.length
          : scoredExams.length;
      const processScore =
        denominator > 0
          ? Math.round(
              scoredExams.reduce((sum, e) => sum + e.best.percentage, 0) /
                denominator
            )
          : 0;

      const withAccount = candidateRows.find((r) => r.user_id);
      const withEmail = candidateRows.find((r) => r.participant_email);

      return {
        key,
        userId: withAccount?.user_id ?? null,
        name: pickName(candidateRows),
        email: withEmail?.participant_email ?? null,
        exams,
        totalAttempts: candidateRows.length,
        examsPassed: exams.filter((e) => e.best.passed).length,
        processScore,
        pendingExamTypes,
        lastActivityAt: candidateRows.reduce(
          (latest, r) =>
            time(r.created_at) > time(latest) ? r.created_at : latest,
          candidateRows[0].created_at
        ),
      } satisfies CandidateGroup<T>;
    })
    .sort((a, b) => {
      if (b.processScore !== a.processScore)
        return b.processScore - a.processScore;
      if (b.examsPassed !== a.examsPassed) return b.examsPassed - a.examsPassed;
      return time(b.lastActivityAt) - time(a.lastActivityAt);
    });
}

/** Número de intento (1-based) y total, por examen y candidato. */
export function buildAttemptNumbers(rows: CandidateResultRow[]) {
  const groups = new Map<string, CandidateResultRow[]>();
  for (const row of rows) {
    const key = `${candidateKeyOf(row)}|${row.exam_type}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const result = new Map<string, { index: number; total: number }>();
  for (const group of groups.values()) {
    const sorted = [...group].sort(
      (a, b) => time(a.created_at) - time(b.created_at)
    );
    sorted.forEach((row, i) =>
      result.set(row.id, { index: i + 1, total: sorted.length })
    );
  }
  return result;
}
