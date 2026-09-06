import { describe, it, expect } from 'vitest';
import { isAnswerEmpty } from '@/app/assessments/_shared/lib/answers';

// Decide cuantas preguntas se avisan como "sin responder" antes de un envio
// irreversible. Un falso negativo aca hace que el usuario envie en blanco sin
// enterarse, que es justo lo que P0-5 viene a evitar.
describe('isAnswerEmpty', () => {
  it('considera vacío lo que no tiene valor', () => {
    expect(isAnswerEmpty(undefined)).toBe(true);
    expect(isAnswerEmpty(null)).toBe(true);
  });

  it('considera vacío el texto en blanco', () => {
    expect(isAnswerEmpty('')).toBe(true);
    expect(isAnswerEmpty('   ')).toBe(true);
    expect(isAnswerEmpty('\n\t')).toBe(true);
  });

  it('considera vacía una selección múltiple sin opciones', () => {
    expect(isAnswerEmpty([])).toBe(true);
  });

  it('reconoce respuestas reales', () => {
    expect(isAnswerEmpty('a')).toBe(false);
    expect(isAnswerEmpty('falso')).toBe(false);
    expect(isAnswerEmpty(['a'])).toBe(false);
    expect(isAnswerEmpty(['a', 'b'])).toBe(false);
  });

  it('no confunde valores falsy que sí son respuestas', () => {
    // "0" como opción elegida, o false en un verdadero/falso, son respuestas.
    expect(isAnswerEmpty('0')).toBe(false);
    expect(isAnswerEmpty(false)).toBe(false);
    expect(isAnswerEmpty(0)).toBe(false);
  });
});
