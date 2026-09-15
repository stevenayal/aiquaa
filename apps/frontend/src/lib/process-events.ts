// Helpers compartidos por /empresa/procesos y /empresa/eventos para el estado
// efectivo de un proceso y el orden / resumen de los eventos
// (hiring_process_groups). Puros y sin dependencias de React para poder
// memoizarlos y testearlos.

export type ProcessStatus = 'draft' | 'active' | 'closed';
export type EffectiveProcessStatus = ProcessStatus | 'expired';

type StatusLike = { status: ProcessStatus; expires_at?: string | null };

/** `active` con fecha límite pasada se muestra como `expired`. */
export function getEffectiveProcessStatus(
  p: StatusLike,
  now: number = Date.now()
): EffectiveProcessStatus {
  if (
    p.status === 'active' &&
    p.expires_at &&
    new Date(p.expires_at).getTime() < now
  ) {
    return 'expired';
  }
  return p.status;
}

/** Cerrado o vencido: los candidatos ya no pueden rendir. */
export function isProcessFinished(p: StatusLike, now: number = Date.now()) {
  const s = getEffectiveProcessStatus(p, now);
  return s === 'closed' || s === 'expired';
}

export type EventSummary = {
  total: number;
  /** Activos y no vencidos. */
  open: number;
  draft: number;
  closed: number;
  expired: number;
  /** Fecha límite más próxima entre los procesos abiertos (ms), o null. */
  nextExpiry: number | null;
  /** Tiene procesos y ninguno está abierto ni en borrador. */
  finished: boolean;
};

export function summarizeEvent(
  processes: StatusLike[],
  now: number = Date.now()
): EventSummary {
  const summary: EventSummary = {
    total: processes.length,
    open: 0,
    draft: 0,
    closed: 0,
    expired: 0,
    nextExpiry: null,
    finished: false,
  };
  for (const p of processes) {
    const s = getEffectiveProcessStatus(p, now);
    if (s === 'active') {
      summary.open++;
      if (p.expires_at) {
        const t = new Date(p.expires_at).getTime();
        if (summary.nextExpiry === null || t < summary.nextExpiry)
          summary.nextExpiry = t;
      }
    } else if (s === 'draft') summary.draft++;
    else if (s === 'closed') summary.closed++;
    else summary.expired++;
  }
  summary.finished =
    summary.total > 0 && summary.open === 0 && summary.draft === 0;
  return summary;
}

export type EventSort = 'recent' | 'oldest' | 'name' | 'expiry' | 'open_count';

export const EVENT_SORT_OPTIONS: { value: EventSort; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'name', label: 'Nombre (A–Z)' },
  { value: 'expiry', label: 'Próximos a vencer' },
  { value: 'open_count', label: 'Más procesos activos' },
];

export function isEventSort(value: unknown): value is EventSort {
  return EVENT_SORT_OPTIONS.some((o) => o.value === value);
}

type GroupLike = { id: string; name: string; created_at: string };

/**
 * Ordena los eventos: primero los activos (con al menos un proceso abierto),
 * y dentro de cada bloque según el criterio elegido. No muta el array.
 */
export function sortEvents<G extends GroupLike>(
  groups: G[],
  summaries: Map<string, EventSummary>,
  sort: EventSort
): G[] {
  const created = (g: G) => new Date(g.created_at).getTime();
  const summaryOf = (g: G) => summaries.get(g.id);

  const compare = (a: G, b: G): number => {
    const sa = summaryOf(a);
    const sb = summaryOf(b);
    const activeA = (sa?.open ?? 0) > 0 ? 0 : 1;
    const activeB = (sb?.open ?? 0) > 0 ? 0 : 1;
    if (activeA !== activeB) return activeA - activeB;

    switch (sort) {
      case 'oldest':
        return created(a) - created(b);
      case 'name':
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      case 'expiry': {
        const ea = sa?.nextExpiry ?? Number.POSITIVE_INFINITY;
        const eb = sb?.nextExpiry ?? Number.POSITIVE_INFINITY;
        if (ea !== eb) return ea < eb ? -1 : 1;
        return created(b) - created(a);
      }
      case 'open_count': {
        const diff = (sb?.open ?? 0) - (sa?.open ?? 0);
        return diff !== 0 ? diff : created(b) - created(a);
      }
      case 'recent':
      default:
        return created(b) - created(a);
    }
  };

  return [...groups].sort(compare);
}

/** Lectura/escritura tolerante a fallos de localStorage (modo privado, SSR). */
export function readStoredPreference(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStoredPreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}
