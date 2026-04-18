'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook para registrar uso y errores de herramientas en Supabase.
 *
 * @example
 * const { logUsage, logError } = useToolUsage('data-generator');
 * logUsage('generate');
 * logError(error, 'generate', { recordCount: 10 });
 */
export function useToolUsage(toolSlug: string) {
  const logUsage = useCallback(
    async (action: string = 'use') => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.rpc('log_tool_usage', {
          p_tool_slug: toolSlug,
          p_action: action,
        });
      } catch {
        // Silencioso — no romper la herramienta si falla el tracking
      }
    },
    [toolSlug],
  );

  const logError = useCallback(
    async (
      error: unknown,
      action: string = 'use',
      context?: Record<string, unknown>,
    ) => {
      try {
        const supabase = createClient();

        const message =
          error instanceof Error ? error.message : String(error);
        const stack =
          error instanceof Error ? (error.stack ?? null) : null;

        await supabase.rpc('log_tool_error', {
          p_tool_slug: toolSlug,
          p_error_message: message,
          p_error_stack: stack,
          p_context: context
            ? { action, ...context }
            : { action },
        });
      } catch {
        // Silencioso
      }
    },
    [toolSlug],
  );

  return { logUsage, logError };
}
