'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

// useLayoutEffect avisa en SSR; en el servidor no hay <dialog> que abrir.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ModalProps {
  /** Se llama cuando el diálogo se cierra (Esc, gesto atrás o `dialog.close()`). */
  onClose: () => void;
  /** id del título visible del modal (nombre accesible). */
  labelledBy: string;
  /** Clases del panel (ancho, fondo, bordes…). */
  className?: string;
  children: ReactNode;
}

/**
 * Modal basado en el `<dialog>` nativo, pensado para montarse condicionalmente:
 *
 *   {open && <Modal onClose={() => setOpen(false)} labelledBy="x">…</Modal>}
 *
 * Al montarse llama a `showModal()`, que aporta página inerte, contención de
 * foco, top layer, `::backdrop` y cierre con Esc. Al desmontarse cierra el
 * diálogo ANTES de que React lo quite del DOM (layout effect), así el
 * navegador devuelve el foco al botón que lo abrió.
 *
 * No agregar `role="dialog"`, `aria-modal`, focus traps ni bloquear el scroll
 * con `overflow: hidden` en <body>: lo resuelve el navegador y `.app-dialog`
 * en globals.css.
 */
export function Modal({
  onClose,
  labelledBy,
  className = '',
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useIsomorphicLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const handleClose = () => onCloseRef.current();
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className={`app-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto p-0 ${className}`}
    >
      {children}
    </dialog>
  );
}
