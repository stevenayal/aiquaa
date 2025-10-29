import type { AuditLogEntry } from './types';
import { getCandidateId } from './prng';

const AUDIT_LOG_KEY = 'test-app:audit-log';
const MAX_LOG_ENTRIES = 200;

/**
 * Add entry to audit log
 */
export function logAction(
  action: string,
  details: Record<string, any> = {},
  success: boolean = true
): void {
  if (typeof window === 'undefined') return;

  const candidateId = getCandidateId() || 'unknown';

  const entry: AuditLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    candidateId,
    action,
    details,
    success,
  };

  const existing = getAuditLog();
  const updated = [entry, ...existing].slice(0, MAX_LOG_ENTRIES);

  try {
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save audit log:', e);
  }
}

/**
 * Get all audit log entries
 */
export function getAuditLog(): AuditLogEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(AUDIT_LOG_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load audit log:', e);
    return [];
  }
}

/**
 * Get audit log for current candidate only
 */
export function getCurrentCandidateLog(): AuditLogEntry[] {
  const candidateId = getCandidateId();
  if (!candidateId) return [];

  return getAuditLog().filter((entry) => entry.candidateId === candidateId);
}

/**
 * Clear audit log
 */
export function clearAuditLog(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUDIT_LOG_KEY);
}

/**
 * Export audit log as JSON string
 */
export function exportAuditLog(): string {
  const log = getCurrentCandidateLog();
  return JSON.stringify(log, null, 2);
}

// Convenience functions for common actions

export function logLogin(email: string, success: boolean): void {
  logAction('LOGIN', { email }, success);
}

export function logLogout(): void {
  logAction('LOGOUT', {});
}

export function logRegister(email: string, success: boolean): void {
  logAction('REGISTER', { email }, success);
}

export function logAddToCart(productId: string, quantity: number): void {
  logAction('ADD_TO_CART', { productId, quantity });
}

export function logUpdateCartQty(productId: string, oldQty: number, newQty: number): void {
  logAction('UPDATE_CART_QTY', { productId, oldQty, newQty });
}

export function logRemoveFromCart(productId: string): void {
  logAction('REMOVE_FROM_CART', { productId });
}

export function logCheckoutAttempt(total: number): void {
  logAction('CHECKOUT_ATTEMPT', { total });
}

export function logCheckoutSuccess(orderId: string, total: number): void {
  logAction('CHECKOUT_SUCCESS', { orderId, total });
}

export function logCheckoutFail(reason: string): void {
  logAction('CHECKOUT_FAIL', { reason }, false);
}

export function logCreateTicket(subject: string, priority: string): void {
  logAction('CREATE_TICKET', { subject, priority });
}

export function logUpdateProfile(fields: string[]): void {
  logAction('UPDATE_PROFILE', { fields });
}

export function logSearch(query: string, resultsCount: number): void {
  logAction('SEARCH', { query, resultsCount });
}

export function logFilter(category: string | null): void {
  logAction('FILTER_CATEGORY', { category });
}

export function logSort(sortBy: string): void {
  logAction('SORT', { sortBy });
}
