import { describe, expect, it } from 'vitest';
import { scoreAssessmentQuestion } from '../scoring';
import type { AssessmentQuestion } from '../../types';

// Pregunta espejo de las de "varias respuestas" de los Excel del bootcamp:
// 3 correctas de 4 opciones, 10 puntos.
const question: AssessmentQuestion = {
  id: 'q1',
  section_id: 's1',
  question_type: 'multiple_select',
  prompt: '¿Cuáles prácticas forman parte de la seguridad fundamental?',
  options: [
    { label: 'Contraseñas robustas', value: 'a' },
    { label: 'Limitar exposición de red', value: 'b' },
    { label: 'Actualizaciones regulares', value: 'c' },
    { label: 'Publicar el servicio sin restricciones', value: 'd' },
  ],
  correct_answer: { values: ['a', 'b', 'c'] },
  points: 10,
  order_index: 1,
};

function score(answer: unknown) {
  return scoreAssessmentQuestion(question, answer);
}

describe('scoreAssessmentQuestion — multiple_select', () => {
  it('da el puntaje completo con la selección exacta', () => {
    const result = score({ values: ['a', 'b', 'c'] });
    expect(result.score).toBe(10);
    expect(result.isCorrect).toBe(true);
  });

  it('ignora el orden de las opciones', () => {
    expect(score({ values: ['c', 'a', 'b'] }).score).toBe(10);
  });

  it('da crédito parcial cuando faltan opciones', () => {
    const result = score({ values: ['a', 'b'] });
    expect(result.score).toBe(7); // round(10 * 2/3)
    expect(result.isCorrect).toBe(false);
  });

  it('penaliza cada distractor marcado', () => {
    // 3 aciertos - 1 extra = 2 netos sobre 3
    const result = score({ values: ['a', 'b', 'c', 'd'] });
    expect(result.score).toBe(7);
    expect(result.isCorrect).toBe(false);
  });

  it('no baja de cero cuando hay más distractores que aciertos', () => {
    const result = score({ values: ['d'] });
    expect(result.score).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  it('marca como vacía la respuesta sin selección', () => {
    expect(score({ values: [] }).score).toBe(0);
    expect(score(undefined).score).toBe(0);
    expect(score({ values: [] }).feedback).toMatch(/ninguna opción/i);
  });

  it('acepta un array plano como respuesta', () => {
    expect(score(['a', 'b', 'c']).score).toBe(10);
  });

  it('deduplica las opciones repetidas', () => {
    expect(score({ values: ['a', 'a', 'b', 'c'] }).score).toBe(10);
  });

  it('devuelve cero si la pregunta no tiene answer key', () => {
    const broken = { ...question, correct_answer: {} } as AssessmentQuestion;
    expect(scoreAssessmentQuestion(broken, { values: ['a'] }).score).toBe(0);
  });
});
