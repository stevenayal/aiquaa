import { describe, expect, it } from 'vitest';
import { autoScore } from '../lib/scoring';
import type { BugReport, TestCase, TestCaseType } from '../types';

function testCase(
  id: number,
  type: TestCaseType,
  steps: string,
  expectedResult = 'Debe responder con status 200 y JSON con campos esperados.'
): TestCase {
  return {
    id,
    attemptId: 1,
    title: `Caso ${id} ${type}`,
    preconditions: 'API publica disponible.',
    steps,
    expectedResult,
    type,
    priority: 'medium',
    createdAt: '2026-06-25T00:00:00.000Z',
  };
}

function finding(id: number, text: string): BugReport {
  return {
    id,
    attemptId: 1,
    title: `Hallazgo ${id}`,
    description: text,
    stepsToReproduce:
      'Ejecutar GET https://rickandmortyapi.com/api/character/?status=invalid y revisar status code y body JSON.',
    actualResult: `Status 404 con body observado. ${text}`,
    expectedResult:
      'La API deberia devolver un error claro, documentado y consistente.',
    severity: 'medium',
    priority: 'medium',
    endpoint: 'GET https://rickandmortyapi.com/api/character',
    evidence:
      'curl https://rickandmortyapi.com/api/character/?status=invalid -i',
    createdAt: '2026-06-25T00:00:00.000Z',
  };
}

describe('autoScore flexible API challenge', () => {
  it('scores low when deliverables are incomplete', () => {
    const result = autoScore(
      [testCase(1, 'positive', 'GET https://api.chucknorris.io/jokes/random')],
      [],
      'Resumen corto.'
    );

    expect(result.totalScore).toBeLessThan(40);
    expect(result.feedback).toContain('Faltan casos de prueba');
    expect(result.feedback).toContain('Faltan hallazgos');
  });

  it('scores well with varied reproducible cases and findings', () => {
    const cases = [
      testCase(
        1,
        'positive',
        'GET https://rickandmortyapi.com/api/character/?name=rick con status 200 y body JSON.'
      ),
      testCase(
        2,
        'negative',
        'GET https://rickandmortyapi.com/api/character/999999 para validar status 404 y body de error.'
      ),
      testCase(
        3,
        'boundary',
        'GET https://rickandmortyapi.com/api/character/?page=42 y page=43 para validar paginacion.'
      ),
      testCase(
        4,
        'contract',
        'GET https://rickandmortyapi.com/api/character/1 para validar schema, campos obligatorios y tipos.'
      ),
      testCase(
        5,
        'security',
        'GET https://rickandmortyapi.com/api/character con headers inesperados para confirmar que no expone datos sensibles.'
      ),
      testCase(
        6,
        'contract',
        'GET https://rickandmortyapi.com/api/episode?episode=S01E01 para validar filtros y array results.'
      ),
    ];
    const findings = [
      finding(
        1,
        'Riesgo de contrato: el mensaje de error para filtro invalido no documenta campos requeridos ni tipo esperado.'
      ),
      finding(
        2,
        'Limitacion de paginacion: page fuera de rango requiere mejor recomendacion para el usuario y evidencia de status code.'
      ),
    ];
    const summary =
      'La cobertura incluyo escenarios positivos, negativos, borde y contrato sobre API publica. Los hallazgos principales se relacionan con riesgo de contrato, datos, status code y evidencia reproducible. La recomendacion es documentar errores, filtros y paginacion para reducir ambiguedad.';

    const result = autoScore(cases, findings, summary);

    expect(result.totalScore).toBeGreaterThanOrEqual(80);
    expect(result.bugTagsFound).toEqual([]);
  });

  it('does not depend on banking-specific keywords', () => {
    const cases = Array.from({ length: 6 }, (_, index) =>
      testCase(
        index + 1,
        [
          'positive',
          'negative',
          'boundary',
          'contract',
          'security',
          'contract',
        ][index] as TestCaseType,
        `GET https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=2024-01-0${index + 1} para validar status, body JSON, schema, campo fecha y media_type.`
      )
    );
    const findings = [
      finding(
        1,
        'La respuesta de fecha futura tiene riesgo de error poco claro para el usuario.'
      ),
      finding(
        2,
        'La dependencia de DEMO_KEY es una limitacion operativa por rate limit.'
      ),
    ];
    const summary =
      'Evaluacion de NASA APOD con cobertura de fecha valida, fecha futura, contrato, datos, status y evidencia. Hallazgos: riesgo en mensajes y limitacion por API key. Recomendacion: documentar limites y errores esperados.';

    const result = autoScore(cases, findings, summary);

    expect(result.totalScore).toBeGreaterThanOrEqual(70);
    expect(result.feedback).not.toContain('saldo');
    expect(result.feedback).not.toContain('transferencia');
  });
});
