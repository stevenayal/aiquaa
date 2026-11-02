import { describe, expect, it } from 'vitest';
import {
  buildAttemptNumbers,
  candidateKeyOf,
  dedupeMirroredAttempts,
  getMirroredAttemptId,
  groupResultsByCandidate,
  type CandidateResultRow,
} from '../candidateResults';

const row = (
  overrides: Partial<CandidateResultRow> & { id: string }
): CandidateResultRow => ({
  user_id: 'u1',
  participant_name: 'Ana Pérez',
  participant_email: 'ana@example.com',
  exam_type: 'gherkin-fundamentals',
  percentage: 50,
  passed: false,
  created_at: '2026-10-01T10:00:00Z',
  ...overrides,
});

describe('dedupeMirroredAttempts', () => {
  it('descarta los attempts que ya tienen espejo en exam_results', () => {
    const attempts = [{ id: 'a1' }, { id: 'a2' }];
    const examResults = [
      { metadata: { assessment_attempt_id: 'a1' } },
      { metadata: null },
      { metadata: ['x'] },
    ];
    expect(dedupeMirroredAttempts(attempts, examResults)).toEqual([
      { id: 'a2' },
    ]);
  });

  it('conserva todo si no hay espejos (intentos viejos)', () => {
    const attempts = [{ id: 'a1' }];
    expect(dedupeMirroredAttempts(attempts, [{}])).toBe(attempts);
  });

  it('lee el id del metadata solo si es un string', () => {
    expect(getMirroredAttemptId({ assessment_attempt_id: 'a1' })).toBe('a1');
    expect(getMirroredAttemptId({ assessment_attempt_id: 5 })).toBeNull();
    expect(getMirroredAttemptId(undefined)).toBeNull();
  });
});

describe('candidateKeyOf', () => {
  it('prioriza la cuenta, después email y nombre normalizados', () => {
    expect(candidateKeyOf(row({ id: '1' }))).toBe('u:u1');
    expect(
      candidateKeyOf(
        row({ id: '2', user_id: null, participant_email: ' ANA@Example.com ' })
      )
    ).toBe('e:ana@example.com');
    expect(
      candidateKeyOf(row({ id: '3', user_id: null, participant_email: null }))
    ).toBe('n:ana pérez');
    expect(
      candidateKeyOf(
        row({
          id: '4',
          user_id: null,
          participant_email: null,
          participant_name: null,
        })
      )
    ).toBe('r:4');
  });
});

describe('groupResultsByCandidate', () => {
  const required = ['gherkin-fundamentals', 'git-practico'];

  it('agrupa por candidato y toma el mejor intento por examen', () => {
    const rows = [
      row({ id: '1', percentage: 40, created_at: '2026-10-01T10:00:00Z' }),
      row({
        id: '2',
        percentage: 80,
        passed: true,
        created_at: '2026-10-02T10:00:00Z',
      }),
      row({
        id: '3',
        percentage: 60,
        created_at: '2026-10-03T10:00:00Z',
      }),
      row({
        id: '4',
        user_id: 'u2',
        participant_name: 'beto@example.com',
        participant_email: 'beto@example.com',
        exam_type: 'git-practico',
        percentage: 100,
        passed: true,
      }),
    ];

    const groups = groupResultsByCandidate(rows, required);
    expect(groups).toHaveLength(2);

    const ana = groups.find((g) => g.userId === 'u1')!;
    expect(ana.totalAttempts).toBe(3);
    expect(ana.exams).toHaveLength(1);
    expect(ana.exams[0].best.id).toBe('2');
    expect(ana.exams[0].attempts.map((a) => a.id)).toEqual(['1', '2', '3']);
    expect(ana.examsPassed).toBe(1);
    expect(ana.pendingExamTypes).toEqual(['git-practico']);
    // (80 + 0 pendiente) / 2 exámenes requeridos
    expect(ana.processScore).toBe(40);
    expect(ana.lastActivityAt).toBe('2026-10-03T10:00:00Z');

    const beto = groups.find((g) => g.userId === 'u2')!;
    expect(beto.processScore).toBe(50);
    expect(beto.name).toBe('beto@example.com');
  });

  it('prefiere un nombre real a un email usado como nombre', () => {
    const groups = groupResultsByCandidate([
      row({
        id: '1',
        participant_name: 'ana@example.com',
        created_at: '2026-10-05T10:00:00Z',
      }),
      row({ id: '2', participant_name: 'Ana Pérez' }),
    ]);
    expect(groups[0].name).toBe('Ana Pérez');
  });

  it('ordena por puntaje del proceso y respeta el orden de exámenes', () => {
    const groups = groupResultsByCandidate(
      [
        row({ id: '1', user_id: 'low', percentage: 10 }),
        row({
          id: '2',
          user_id: 'high',
          exam_type: 'git-practico',
          percentage: 90,
        }),
        row({ id: '3', user_id: 'high', percentage: 70 }),
      ],
      required
    );
    expect(groups.map((g) => g.userId)).toEqual(['high', 'low']);
    expect(groups[0].exams.map((e) => e.examType)).toEqual(required);
    expect(groups[0].processScore).toBe(80);
  });

  it('sin exámenes requeridos promedia los rendidos', () => {
    const groups = groupResultsByCandidate([
      row({ id: '1', percentage: 60 }),
      row({ id: '2', exam_type: 'git', percentage: 100 }),
    ]);
    expect(groups[0].processScore).toBe(80);
    expect(groups[0].pendingExamTypes).toEqual([]);
  });
});

describe('buildAttemptNumbers', () => {
  it('numera los intentos por candidato y examen en orden cronológico', () => {
    const numbers = buildAttemptNumbers([
      row({ id: 'b', created_at: '2026-10-02T10:00:00Z' }),
      row({ id: 'a', created_at: '2026-10-01T10:00:00Z' }),
      row({ id: 'c', exam_type: 'git' }),
    ]);
    expect(numbers.get('a')).toEqual({ index: 1, total: 2 });
    expect(numbers.get('b')).toEqual({ index: 2, total: 2 });
    expect(numbers.get('c')).toEqual({ index: 1, total: 1 });
  });
});
