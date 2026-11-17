'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Diálogo de confirmación basado en el elemento nativo `<dialog>`.
 *
 * Reemplaza a `window.confirm()`, que bloquea el hilo principal, no respeta el
 * tema (claro/oscuro) ni la tipografía de la app y no se puede testear con
 * Playwright sin interceptar el evento `dialog`.
 *
 * Con `showModal()` el navegador ya aporta: página inerte, contención de foco,
 * top layer, `::backdrop`, cierre con Esc / gesto atrás y devolución del foco
 * al botón que lo abrió. Por eso NO se agrega `role="dialog"`, `aria-modal`,
 * focus trap ni manejador de Esc. Los estilos de scroll y animación viven en
 * `globals.css` (`.confirm-dialog`).
 */

export interface ConfirmOptions {
  /** Pregunta principal (título accesible del diálogo). */
  title: string;
  /** Detalle opcional; respeta saltos de línea (`\n`). */
  description?: string;
  /** Texto del botón de confirmación. */
  confirmLabel?: string;
  /** Texto del botón seguro. */
  cancelLabel?: string;
  /** Pinta el botón de confirmación en rojo (acciones destructivas). */
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

const CONFIRM_VALUE = 'confirm';

function normalize(options: ConfirmOptions | string): ConfirmOptions {
  return typeof options === 'string' ? { title: options } : options;
}

/**
 * Devuelve una función `confirm()` asíncrona. Fuera de un `ConfirmProvider`
 * cae en `window.confirm` para no romper el flujo.
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  return useCallback<ConfirmFn>(
    (options) => {
      if (ctx) return ctx(options);
      const { title, description } = normalize(options);
      return Promise.resolve(
        typeof window !== 'undefined' &&
          window.confirm(description ? `${title}\n\n${description}` : title)
      );
    },
    [ctx]
  );
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback<ConfirmFn>(
    (input) => {
      // Si ya había una confirmación pendiente, se considera cancelada.
      settle(false);
      setOptions(normalize(input));
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
      });
    },
    [settle]
  );

  // Abrir después de renderizar el contenido para que el nombre accesible ya
  // esté presente cuando el lector de pantalla anuncie el diálogo.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!options || !dialog || dialog.open) return;
    dialog.showModal();
    // En una confirmación destructiva el foco inicial va a la acción segura.
    cancelRef.current?.focus();
  }, [options]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      // Esc / clic fuera no setean returnValue; algunos navegadores no limpian
      // el anterior, por eso se resetea siempre y '' cuenta como "cancelar".
      const confirmed = dialog.returnValue === CONFIRM_VALUE;
      dialog.returnValue = '';
      settle(confirmed);
    };
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [settle]);

  // Si el provider se desmonta con una confirmación pendiente, no la dejamos colgada.
  useEffect(() => () => settle(false), [settle]);

  const destructive = options?.destructive ?? true;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        className="confirm-dialog w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        aria-labelledby={titleId}
        aria-describedby={options?.description ? descriptionId : undefined}
        // `closedby` (clic fuera para cerrar) es mejora progresiva: donde no
        // existe, Esc y el gesto atrás siguen cerrando el modal.
        {...({ closedby: 'any' } as Record<string, string>)}
      >
        <form method="dialog" className="p-6">
          <h2 id={titleId} className="text-lg font-semibold">
            {options?.title}
          </h2>
          {options?.description && (
            <p
              id={descriptionId}
              className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300"
            >
              {options.description}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              ref={cancelRef}
              type="submit"
              value="cancel"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              {options?.cancelLabel ?? 'Cancelar'}
            </button>
            <button
              type="submit"
              value={CONFIRM_VALUE}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                destructive
                  ? 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-500'
              }`}
            >
              {options?.confirmLabel ?? 'Confirmar'}
            </button>
          </div>
        </form>
      </dialog>
    </ConfirmContext.Provider>
  );
}
