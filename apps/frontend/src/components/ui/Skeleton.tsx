/**
 * Bloque de carga (skeleton).
 *
 * `motion-safe:` en vez de `animate-pulse` a secas: quien tenga activado
 * "reducir movimiento" en el sistema ve el bloque quieto en vez de latiendo.
 * El skeleton sigue cumpliendo su funcion (reservar el espacio y avisar que
 * falta contenido) sin la animacion (WCAG 2.3.3).
 */
export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded bg-slate-200 dark:bg-slate-800 motion-safe:animate-pulse ${className}`}
    />
  );
}

/**
 * Envoltorio de una pantalla en carga.
 *
 * El estado de carga tiene que anunciarse, no solo dibujarse: sin esto un
 * lector de pantalla no dice nada mientras la ruta se resuelve. role="status"
 * + aria-live="polite" lo anuncian sin interrumpir, y el texto visualmente
 * oculto da el mensaje que los bloques no pueden transmitir.
 */
export function SkeletonScreen({
  label = 'Cargando…',
  className = '',
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${className}`}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
