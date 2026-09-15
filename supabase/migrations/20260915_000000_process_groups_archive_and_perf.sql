-- Eventos (hiring_process_groups): "dar de baja" + performance del listado
-- de procesos (/empresa/procesos, /empresa/eventos, /empresa/procesos/[id]).
--
-- 1. archived_at: un evento que ya terminó se "da de baja" en vez de
--    eliminarse — conserva sus procesos, resultados y estadísticas, y se
--    oculta de los listados activos. NULL = evento vigente.
--
-- 2. Índices faltantes en prod (el advisor los marcaba):
--    - hiring_processes.group_id (FK sin índice; lo usan el listado agrupado,
--      getEventStatsAction y candidate_touched_event_group()).
--    - hiring_process_groups.empresa_id (FK sin índice; lo usa cada policy).
--    - assessment_attempts((metadata->>'processCode')): la migración
--      20260625_020000 lo declaraba como índice PARCIAL (WHERE metadata ?
--      'processCode'), pero nunca llegó a prod, y además un índice parcial con
--      ese predicado no sirve para `metadata->>'processCode' = $1` (el planner
--      no puede deducir el `?` a partir del `=`). Se crea sin predicado.
--
-- 3. candidate_touched_event_group(): la policy
--    candidates_select_own_event_processes la evalúa por CADA fila de
--    hiring_processes con group_id, también para usuarios de empresa. La
--    versión anterior partía de hiring_processes y buscaba resultados por
--    process_code / metadata (sin índice). Ahora parte de los resultados del
--    propio usuario (índices por user_id), que para un usuario de empresa son
--    cero filas → la función resuelve casi gratis. Misma semántica.
--
-- 4. Policies de hiring_process_groups / hiring_processes: `auth.uid()` se
--    envuelve en `(select auth.uid())` para que Postgres lo evalúe una sola
--    vez por query (initplan) y no por fila. Misma semántica.

-- 1 ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.hiring_process_groups
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- 2 ─────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_hiring_processes_group_id
  ON public.hiring_processes (group_id)
  WHERE group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hiring_process_groups_empresa_id
  ON public.hiring_process_groups (empresa_id);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_metadata_process_code
  ON public.assessment_attempts ((metadata->>'processCode'));

-- 3 ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.candidate_touched_event_group(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.exam_results er
      JOIN public.hiring_processes hp ON hp.code = er.process_code
      WHERE er.user_id = auth.uid()
        AND hp.group_id = p_group_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.assessment_attempts aa
      JOIN public.hiring_processes hp ON hp.code = aa.metadata->>'processCode'
      WHERE aa.user_id = auth.uid()
        AND hp.group_id = p_group_id
    );
$$;

-- 4 ─────────────────────────────────────────────────────────────────────────
ALTER POLICY "empresa_members_select_groups" ON public.hiring_process_groups
  USING (
    empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = (SELECT auth.uid()))
  );

ALTER POLICY "empresa_members_insert_groups" ON public.hiring_process_groups
  WITH CHECK (
    empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = (SELECT auth.uid()))
  );

ALTER POLICY "empresa_members_update_groups" ON public.hiring_process_groups
  USING (
    empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = (SELECT auth.uid()))
  );

ALTER POLICY "empresa_members_delete_groups" ON public.hiring_process_groups
  USING (
    empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = (SELECT auth.uid()))
  );

ALTER POLICY "hiring_processes_empresa_access" ON public.hiring_processes
  USING (
    created_by = (SELECT auth.uid())
    OR (
      empresa_id IS NOT NULL
      AND public.is_active_empresa_member(empresa_id)
    )
  )
  WITH CHECK (
    created_by = (SELECT auth.uid())
    OR (
      empresa_id IS NOT NULL
      AND public.is_active_empresa_member(empresa_id)
    )
  );
