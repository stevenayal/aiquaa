/**
 * Utilidades puras sobre las respuestas de una seccion.
 *
 * Viven fuera del componente a proposito: AssessmentSectionScreen importa las
 * server actions del assessment, que arrastran `server-only`, asi que nada que
 * se quiera testear en aislamiento deberia colgar de ese modulo.
 */

/**
 * Una respuesta cuenta como sin responder si no hay valor, si es texto en blanco
 * o si es una seleccion multiple vacia. Se usa para avisar cuantas preguntas se
 * van a corregir como incorrectas antes de un envio irreversible.
 *
 * Ojo con los falsy: '0', 0 y false SI son respuestas.
 */
export function isAnswerEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}
