import type { Bug } from './types';
import { PRNG } from './prng';

/**
 * Bug Manifest
 * Defines 10 intentional bugs that can be activated per candidate
 */

export const BUG_IDS = {
  FILTER_INCONSISTENT: 'bug-01-filter-inconsistent',
  SORT_UNSTABLE: 'bug-02-sort-unstable',
  QUANTITY_VALIDATION: 'bug-03-quantity-validation',
  CART_TOTAL_DESYNCED: 'bug-04-cart-total-desynced',
  CHECKOUT_500: 'bug-05-checkout-500',
  TIMEZONE_BUG: 'bug-06-timezone-bug',
  ACCESSIBILITY: 'bug-07-accessibility',
  XSS_REFLECTED: 'bug-08-xss-reflected',
  TICKET_PRIORITY: 'bug-09-ticket-priority',
  STATE_LOST: 'bug-10-state-lost',
} as const;

export const ALL_BUGS: Bug[] = [
  {
    id: BUG_IDS.FILTER_INCONSISTENT,
    name: 'Filtro Inconsistente',
    description: 'Combinar categoría + búsqueda muestra conteo diferente a items renderizados (paginación desfasada)',
    severity: 'medium',
    affectedFeature: 'Catálogo',
    enabled: true,
  },
  {
    id: BUG_IDS.SORT_UNSTABLE,
    name: 'Ordenamiento Inestable',
    description: 'Ordenar por precio no es estable con valores iguales (items saltan al cambiar de página)',
    severity: 'low',
    affectedFeature: 'Catálogo',
    enabled: true,
  },
  {
    id: BUG_IDS.QUANTITY_VALIDATION,
    name: 'Validación de Cantidad Rota',
    description: 'Permite cantidad 0 o mayor al stock si se tipea rápido (onBlur tarda en validar)',
    severity: 'high',
    affectedFeature: 'Carrito',
    enabled: true,
  },
  {
    id: BUG_IDS.CART_TOTAL_DESYNCED,
    name: 'Total del Carrito Desfasado',
    description: 'Al cambiar cantidad rápido, impuestos no recalculan hasta recargar página',
    severity: 'high',
    affectedFeature: 'Carrito',
    enabled: true,
  },
  {
    id: BUG_IDS.CHECKOUT_500,
    name: 'Checkout Error 500 Simulado',
    description: 'Si "Apartment/Suite" > 50 chars, muestra error genérico en vez de validación clara',
    severity: 'medium',
    affectedFeature: 'Checkout',
    enabled: true,
  },
  {
    id: BUG_IDS.TIMEZONE_BUG,
    name: 'Bug de Zona Horaria',
    description: 'Guarda zona "America/Asuncion", pero historial queda en UTC sin convertir',
    severity: 'low',
    affectedFeature: 'Perfil / Historial',
    enabled: true,
  },
  {
    id: BUG_IDS.ACCESSIBILITY,
    name: 'Problemas de Accesibilidad',
    description: 'Botón "Agregar al carrito" sin aria-label cuando disabled; label sin htmlFor',
    severity: 'medium',
    affectedFeature: 'Detalle de Producto',
    enabled: true,
  },
  {
    id: BUG_IDS.XSS_REFLECTED,
    name: 'XSS Reflejado Leve',
    description: 'Búsqueda escapa <script> pero "><test> rompe placeholder (sin ejecutar JS)',
    severity: 'medium',
    affectedFeature: 'Catálogo',
    enabled: true,
  },
  {
    id: BUG_IDS.TICKET_PRIORITY,
    name: 'Prioridad de Ticket Mal Asignada',
    description: 'Seleccionar "Alta" puede terminar "Media" si se envía inmediatamente (estado no sync)',
    severity: 'low',
    affectedFeature: 'Soporte',
    enabled: true,
  },
  {
    id: BUG_IDS.STATE_LOST,
    name: 'Estado Perdido al Volver',
    description: 'Al volver del checkout con botón del navegador, carrito pierde 1 item (no rehidrata bien)',
    severity: 'high',
    affectedFeature: 'Checkout / Carrito',
    enabled: true,
  },
];

/**
 * Get active bugs for a given candidate ID
 * Uses PRNG to deterministically select 6-8 bugs
 */
export function getActiveBugs(candidateId: string): string[] {
  // Check for manual overrides in localStorage
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('test-app:bugs-override');
    if (override) {
      try {
        const parsed = JSON.parse(override);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  // Use PRNG to select bugs
  const prng = new PRNG(candidateId);
  const bugCount = prng.nextInt(6, 8);
  const allBugIds = ALL_BUGS.map((b) => b.id);
  return prng.pick(allBugIds, bugCount);
}

/**
 * Check if a specific bug is active for current session
 */
export function isBugActive(bugId: string, candidateId: string): boolean {
  const activeBugs = getActiveBugs(candidateId);
  return activeBugs.includes(bugId);
}

/**
 * Get all bugs with their active status
 */
export function getBugsWithStatus(candidateId: string): Bug[] {
  const activeBugIds = getActiveBugs(candidateId);
  return ALL_BUGS.map((bug) => ({
    ...bug,
    enabled: activeBugIds.includes(bug.id),
  }));
}

/**
 * Override active bugs (admin only)
 */
export function overrideActiveBugs(bugIds: string[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('test-app:bugs-override', JSON.stringify(bugIds));
  }
}

/**
 * Clear bug overrides
 */
export function clearBugOverrides(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('test-app:bugs-override');
  }
}
