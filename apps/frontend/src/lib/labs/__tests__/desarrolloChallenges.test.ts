import { describe, expect, it } from 'vitest';
import {
  DESARROLLO_CHALLENGES,
  DESARROLLO_CHALLENGE_IDS,
  getDesarrolloChallenge,
  isValidRepoUrl,
} from '../desarrolloChallenges';
import { EXAM_META, POINTS_BASED_TYPES, type ExamType } from '@/lib/exams';
import { reviewHrefFor } from '@/lib/exam-review-routes';

const challenges = DESARROLLO_CHALLENGE_IDS.map(
  (id) => DESARROLLO_CHALLENGES[id]
);

describe('catálogo de pruebas de desarrollo', () => {
  it('define un único proyecto final de desarrollo', () => {
    expect(DESARROLLO_CHALLENGE_IDS).toHaveLength(1);
    expect(DESARROLLO_CHALLENGE_IDS[0]).toBe('dev-proyecto-final');
  });

  it('mantiene id y examType alineados con la clave del record', () => {
    DESARROLLO_CHALLENGE_IDS.forEach((id) => {
      expect(DESARROLLO_CHALLENGES[id].id).toBe(id);
      expect(DESARROLLO_CHALLENGES[id].examType).toBe(id);
    });
  });

  it('está registrado en el catálogo de exámenes apuntando a su lab', () => {
    challenges.forEach((challenge) => {
      const meta = EXAM_META[challenge.examType as ExamType];
      expect(meta).toBeDefined();
      expect(meta.href).toBe(`/labs/desarrollo/${challenge.id}`);
      expect(POINTS_BASED_TYPES.has(challenge.examType as ExamType)).toBe(true);
    });
  });

  it('enruta la corrección a la pantalla de puntaje global', () => {
    challenges.forEach((challenge) => {
      expect(reviewHrefFor(challenge.examType, 'abc')).toBe(
        '/empresa/evaluar-desarrollo/abc'
      );
    });
    expect(reviewHrefFor('test-app', 'abc')).toBe('/empresa/evaluar/abc');
    expect(reviewHrefFor('cicd-fundamentals', 'abc')).toBeNull();
    expect(reviewHrefFor(null, 'abc')).toBeNull();
  });

  it('trae consigna, entregables y criterios cubriendo las 5 clases', () => {
    const challenge = DESARROLLO_CHALLENGES['dev-proyecto-final'];
    expect(challenge.consigna.length).toBeGreaterThanOrEqual(6);
    expect(challenge.entregables.length).toBeGreaterThanOrEqual(4);
    expect(challenge.criteriosDeEvaluacion.length).toBeGreaterThanOrEqual(5);
    expect(challenge.objetivo).toBeTruthy();
    expect(challenge.estructuraEsperada).toBeTruthy();

    const consignaText = challenge.consigna.join(' ');
    expect(consignaText).toMatch(/EF Core|Entity Framework/i);
    expect(consignaText).toMatch(/Kubernetes|Deployment|StatefulSet/i);
    expect(consignaText).toMatch(/ConfigMap|Secret|Helm/i);
    expect(consignaText).toMatch(/Serilog|Seq/i);
    expect(consignaText).toMatch(/GitHub Actions|workflow/i);
  });

  it('resuelve por id y devuelve undefined para uno desconocido', () => {
    expect(getDesarrolloChallenge('dev-proyecto-final')?.title).toContain(
      'Proyecto final'
    );
    expect(getDesarrolloChallenge('no-existe')).toBeUndefined();
  });
});

describe('isValidRepoUrl', () => {
  it('acepta la raíz de un repositorio de GitHub', () => {
    expect(isValidRepoUrl('https://github.com/stevenayal/mi-api')).toBe(true);
    expect(isValidRepoUrl('https://github.com/stevenayal/mi-api/')).toBe(true);
    expect(isValidRepoUrl('  https://github.com/org/repo  ')).toBe(true);
  });

  it('rechaza hosts que no son GitHub', () => {
    expect(isValidRepoUrl('https://gitlab.com/org/repo')).toBe(false);
    expect(isValidRepoUrl('https://githubb.com/org/repo')).toBe(false);
    expect(isValidRepoUrl('http://github.com/org/repo')).toBe(false);
  });

  it('rechaza rutas internas y URLs incompletas', () => {
    expect(isValidRepoUrl('https://github.com/org')).toBe(false);
    expect(isValidRepoUrl('https://github.com/org/repo/tree/main')).toBe(false);
    expect(isValidRepoUrl('github.com/org/repo')).toBe(false);
    expect(isValidRepoUrl('')).toBe(false);
  });
});
