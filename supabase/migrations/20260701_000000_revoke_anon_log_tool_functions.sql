-- SEC: revoke anon EXECUTE on log_tool_usage / log_tool_error.
-- Flagged in QA cycle 2026-06-30 (issue #221): both are SECURITY DEFINER and
-- callable by anon, but useToolUsage.ts only invokes log_tool_usage after
-- confirming an authenticated user, and log_tool_error fails silently
-- (try/catch) for guests, so anon access has no legitimate use and only
-- lets unauthenticated callers insert fake usage/error rows.
REVOKE EXECUTE ON FUNCTION public.log_tool_usage(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_tool_usage(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_tool_usage(text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.log_tool_error(text, text, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_tool_error(text, text, text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_tool_error(text, text, text, jsonb) TO authenticated;
