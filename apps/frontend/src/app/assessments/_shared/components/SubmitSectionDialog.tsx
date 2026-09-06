'use client';

import { useEffect, useRef } from 'react';

/**
 * Confirmacion previa al envio de una seccion.
 *
 * Enviar corrige de forma irreversible: no hay vuelta atras ni segundo intento
 * sobre el mismo nivel. Antes el boton llamaba directo a la accion de envio, con
 * el mismo tratamiento visual que "continuar", asi que un click accidental
 * quemaba el nivel (Regla de Fin de Pico: el peor momento del flujo era su
 * final). Este dialogo nombra lo que se pierde y, sobre todo, avisa cuantas
 * preguntas quedan sin responder, que es el dato que el usuario no tiene a mano
 * cuando el formulario es largo.
 *
 * Accesibilidad: role="dialog" + aria-modal, foco atrapado dentro del dialogo,
 * Escape para cancelar, foco inicial en "Seguir revisando" (la accion segura) y
 * devolucion del foco al elemento que lo abrio.
 */
export default function SubmitSectionDialog({
  open,
  unansweredCount,
  totalQuestions,
  isLastSection,
  isSubmitting,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  unansweredCount: number;
  totalQuestions: number;
  isLastSection: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== 'Tab') return;

      // Trampa de foco: sin esto el tabulador se escapa al resto de la pagina,
      // que sigue detras del overlay y no deberia ser alcanzable.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  const answered = totalQuestions - unansweredCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-section-title"
        aria-describedby="submit-section-description"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
      >
        <h2
          id="submit-section-title"
          className="text-lg font-semibold text-slate-900 dark:text-white"
        >
          {isLastSection ? '¿Finalizar el assessment?' : '¿Enviar este nivel?'}
        </h2>

        <div
          id="submit-section-description"
          className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300"
        >
          <p>
            Al enviar, este nivel se corrige y{' '}
            <strong className="font-semibold text-slate-900 dark:text-white">
              no vas a poder volver a editarlo
            </strong>
            .
          </p>

          {unansweredCount > 0 ? (
            <p className="rounded-2xl border border-amber-400/40 bg-amber-50 dark:bg-amber-400/10 px-4 py-3 text-amber-900 dark:text-amber-200">
              Te{' '}
              {unansweredCount === 1
                ? 'queda 1 pregunta sin responder'
                : `quedan ${unansweredCount} preguntas sin responder`}{' '}
              de {totalQuestions}. Se van a corregir como incorrectas.
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              Respondiste las {totalQuestions} preguntas de este nivel.
            </p>
          )}

          {unansweredCount > 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              Respondidas: {answered} de {totalQuestions}.
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Enviando...'
              : isLastSection
                ? 'Finalizar assessment'
                : 'Enviar y continuar'}
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Seguir revisando
          </button>
        </div>
      </div>
    </div>
  );
}
