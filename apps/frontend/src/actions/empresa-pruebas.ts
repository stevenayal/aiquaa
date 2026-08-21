'use server';

import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';

export type EmpresaPruebaQuestionType =
  | 'multiple_choice'
  | 'multi_select'
  | 'true_false'
  | 'short_text';

export interface EmpresaPrueba {
  id: string;
  empresa_id: string;
  created_by: string | null;
  title: string;
  category: string;
  description: string | null;
  level: string | null;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmpresaPreguntaRow {
  id: string;
  prueba_id: string;
  position: number;
  question_type: EmpresaPruebaQuestionType;
  prompt: string;
  options: unknown;
  correct_answer: unknown;
  expected_keywords: string[] | null;
  points: number;
}

export interface EmpresaPruebaInvitacion {
  id: string;
  prueba_id: string;
  token: string;
  candidate_email: string | null;
  candidate_name: string | null;
  expires_at: string | null;
  max_attempts: number;
  status: 'active' | 'revoked';
  created_by: string | null;
  created_at: string;
}

export interface EmpresaIntentoSummary {
  id: string;
  prueba_id: string;
  invitacion_id: string;
  candidate_name: string | null;
  candidate_email: string | null;
  started_at: string | null;
  submitted_at: string | null;
  score: number | null;
  max_score: number | null;
  breakdown: unknown;
  answers: unknown;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Local copy of the getCallerMembership() pattern from empresa-admin.ts —
 * duplicated deliberately instead of importing, to keep this feature isolated.
 */
async function getCallerEmpresaMembership(
  supabase: SupabaseServerClient,
  callerId: string
) {
  const { data, error } = await supabase
    .from('empresa_miembros')
    .select('id, empresa_id, role, status')
    .eq('user_id', callerId)
    .eq('status', 'active')
    .single();
  if (error || !data) return null;
  return data;
}

type MembershipContext =
  | {
      ok: true;
      user: { id: string };
      membership: {
        id: string;
        empresa_id: string;
        role: string;
        status: string;
      };
    }
  | { ok: false; error: string };

async function requireAuthenticatedMember(
  supabase: SupabaseServerClient
): Promise<MembershipContext> {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { ok: false, error: 'No autenticado' };

  const membership = await getCallerEmpresaMembership(supabase, user.id);
  if (!membership) return { ok: false, error: 'Sin membresia activa' };

  return { ok: true, user, membership };
}

function isAdminRole(role: string) {
  return role === 'owner' || role === 'admin';
}

/** Fetches a prueba scoped to the caller's empresa — null if missing or cross-tenant. */
async function getPruebaForEmpresa(
  supabase: SupabaseServerClient,
  pruebaId: string,
  empresaId: string
) {
  const { data, error } = await supabase
    .from('empresa_pruebas')
    .select('id, empresa_id')
    .eq('id', pruebaId)
    .eq('empresa_id', empresaId)
    .single();
  if (error || !data) return null;
  return data;
}

// ── pruebas ───────────────────────────────────────────────────────────

export async function listPruebasAction(): Promise<{
  data: EmpresaPrueba[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: null, error: ctx.error };

  const { data, error } = await supabase
    .from('empresa_pruebas')
    .select('*')
    .eq('empresa_id', ctx.membership.empresa_id)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaPrueba[], error: null };
}

export async function getPruebaAction(pruebaId: string): Promise<{
  data: EmpresaPrueba | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: null, error: ctx.error };

  const { data, error } = await supabase
    .from('empresa_pruebas')
    .select('*')
    .eq('id', pruebaId)
    .eq('empresa_id', ctx.membership.empresa_id)
    .single();

  if (error) return { data: null, error: 'Prueba no encontrada' };
  return { data: data as EmpresaPrueba, error: null };
}

export async function createPruebaAction(payload: {
  title: string;
  category: string;
  description?: string;
  level?: string;
  duration_minutes?: number;
}): Promise<{ data: EmpresaPrueba | null; error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: null, error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { data: null, error: 'Sin permisos suficientes' };

  const title = payload.title.trim();
  const category = payload.category.trim();
  if (!title) return { data: null, error: 'El titulo es requerido' };
  if (!category) return { data: null, error: 'La categoria es requerida' };

  const { data, error } = await supabase
    .from('empresa_pruebas')
    .insert({
      empresa_id: ctx.membership.empresa_id,
      created_by: ctx.user.id,
      title,
      category,
      description: payload.description?.trim() || null,
      level: payload.level?.trim() || null,
      duration_minutes: payload.duration_minutes ?? null,
    })
    .select('*')
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaPrueba, error: null };
}

export async function updatePruebaAction(
  pruebaId: string,
  payload: {
    title?: string;
    category?: string;
    description?: string;
    level?: string;
    duration_minutes?: number;
  }
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { error: 'Sin permisos suficientes' };

  const update: Record<string, unknown> = {};
  if (payload.title !== undefined) update.title = payload.title.trim();
  if (payload.category !== undefined) update.category = payload.category.trim();
  if (payload.description !== undefined)
    update.description = payload.description.trim() || null;
  if (payload.level !== undefined) update.level = payload.level.trim() || null;
  if (payload.duration_minutes !== undefined)
    update.duration_minutes = payload.duration_minutes;

  const { error } = await supabase
    .from('empresa_pruebas')
    .update(update)
    .eq('id', pruebaId)
    .eq('empresa_id', ctx.membership.empresa_id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function togglePruebaActivaAction(
  pruebaId: string,
  isActive: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { error: 'Sin permisos suficientes' };

  const { error } = await supabase
    .from('empresa_pruebas')
    .update({ is_active: isActive })
    .eq('id', pruebaId)
    .eq('empresa_id', ctx.membership.empresa_id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function deletePruebaAction(
  pruebaId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { error: 'Sin permisos suficientes' };

  const { error } = await supabase
    .from('empresa_pruebas')
    .delete()
    .eq('id', pruebaId)
    .eq('empresa_id', ctx.membership.empresa_id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function listCategoriasAction(): Promise<{
  data: string[];
  error: string | null;
}> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: [], error: ctx.error };

  const { data, error } = await supabase
    .from('empresa_pruebas')
    .select('category')
    .eq('empresa_id', ctx.membership.empresa_id);

  if (error) return { data: [], error: error.message };

  const seen = new Map<string, string>();
  for (const row of data as { category: string }[]) {
    const key = row.category.trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, row.category.trim());
  }

  return { data: Array.from(seen.values()).sort(), error: null };
}

// ── preguntas ─────────────────────────────────────────────────────────

function validatePreguntaShape(payload: {
  question_type: EmpresaPruebaQuestionType;
  options?: unknown;
  correct_answer: unknown;
  expected_keywords?: string[];
}): string | null {
  if (payload.question_type === 'multiple_choice') {
    if (!Array.isArray(payload.options) || payload.options.length < 2)
      return 'multiple_choice requiere al menos 2 opciones';
    if (
      !payload.correct_answer ||
      typeof (payload.correct_answer as { value?: unknown }).value !== 'string'
    )
      return 'multiple_choice requiere correct_answer.value (string)';
  }
  if (payload.question_type === 'multi_select') {
    if (!Array.isArray(payload.options) || payload.options.length < 2)
      return 'multi_select requiere al menos 2 opciones';
    const values = (payload.correct_answer as { values?: unknown } | undefined)
      ?.values;
    if (!Array.isArray(values) || values.length === 0)
      return 'multi_select requiere correct_answer.values (array no vacío)';
    const optionSet = new Set(payload.options as string[]);
    if (!values.every((v) => typeof v === 'string' && optionSet.has(v)))
      return 'multi_select: cada valor de correct_answer.values debe existir en options';
  }
  if (payload.question_type === 'true_false') {
    if (
      !payload.correct_answer ||
      typeof (payload.correct_answer as { value?: unknown }).value !== 'boolean'
    )
      return 'true_false requiere correct_answer.value (boolean)';
  }
  if (payload.question_type === 'short_text') {
    if (!payload.expected_keywords || payload.expected_keywords.length === 0)
      return 'short_text requiere al menos 1 expected_keyword';
  }
  return null;
}

export async function upsertPreguntaAction(payload: {
  id?: string;
  prueba_id: string;
  position: number;
  question_type: EmpresaPruebaQuestionType;
  prompt: string;
  options?: unknown;
  correct_answer: unknown;
  expected_keywords?: string[];
  points?: number;
}): Promise<{ data: EmpresaPreguntaRow | null; error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: null, error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { data: null, error: 'Sin permisos suficientes' };

  const prueba = await getPruebaForEmpresa(
    supabase,
    payload.prueba_id,
    ctx.membership.empresa_id
  );
  if (!prueba) return { data: null, error: 'Prueba no encontrada' };

  if (!payload.prompt.trim())
    return { data: null, error: 'El enunciado es requerido' };

  const shapeError = validatePreguntaShape(payload);
  if (shapeError) return { data: null, error: shapeError };

  const row = {
    prueba_id: payload.prueba_id,
    position: payload.position,
    question_type: payload.question_type,
    prompt: payload.prompt.trim(),
    options:
      payload.question_type === 'multiple_choice' ||
      payload.question_type === 'multi_select'
        ? payload.options
        : null,
    correct_answer: payload.correct_answer,
    expected_keywords:
      payload.question_type === 'short_text' ? payload.expected_keywords : null,
    points: payload.points ?? 1,
  };

  const query = payload.id
    ? supabase
        .from('empresa_preguntas')
        .update(row)
        .eq('id', payload.id)
        .eq('prueba_id', payload.prueba_id)
    : supabase.from('empresa_preguntas').insert(row);

  const { data, error } = await query.select('*').single();

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaPreguntaRow, error: null };
}

export interface BulkPreguntaInput {
  question_type: EmpresaPruebaQuestionType;
  prompt: string;
  options?: unknown;
  correct_answer: unknown;
  expected_keywords?: string[];
  points?: number;
}

/**
 * Crea varias preguntas de una sola vez (ej. importar el JSON generado a partir
 * de un excel de clase). Valida todas antes de insertar cualquiera — si una
 * falla, no se inserta ninguna. Las nuevas preguntas se agregan al final de las
 * ya existentes (position = cantidad actual + índice en el array).
 */
export async function bulkUpsertPreguntasAction(
  pruebaId: string,
  preguntas: BulkPreguntaInput[]
): Promise<{ data: EmpresaPreguntaRow[] | null; error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: null, error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { data: null, error: 'Sin permisos suficientes' };

  const prueba = await getPruebaForEmpresa(
    supabase,
    pruebaId,
    ctx.membership.empresa_id
  );
  if (!prueba) return { data: null, error: 'Prueba no encontrada' };

  if (preguntas.length === 0)
    return { data: null, error: 'No hay preguntas para importar' };

  for (let index = 0; index < preguntas.length; index += 1) {
    const pregunta = preguntas[index];
    if (!pregunta.prompt?.trim())
      return {
        data: null,
        error: `Pregunta ${index + 1}: el enunciado es requerido`,
      };
    const shapeError = validatePreguntaShape(pregunta);
    if (shapeError)
      return { data: null, error: `Pregunta ${index + 1}: ${shapeError}` };
  }

  const { count: existingCount, error: countError } = await supabase
    .from('empresa_preguntas')
    .select('id', { count: 'exact', head: true })
    .eq('prueba_id', pruebaId);

  if (countError) return { data: null, error: countError.message };

  const rows = preguntas.map((pregunta, index) => ({
    prueba_id: pruebaId,
    position: (existingCount ?? 0) + index,
    question_type: pregunta.question_type,
    prompt: pregunta.prompt.trim(),
    options:
      pregunta.question_type === 'multiple_choice' ||
      pregunta.question_type === 'multi_select'
        ? pregunta.options
        : null,
    correct_answer: pregunta.correct_answer,
    expected_keywords:
      pregunta.question_type === 'short_text'
        ? pregunta.expected_keywords
        : null,
    points: pregunta.points ?? 1,
  }));

  const { data, error } = await supabase
    .from('empresa_preguntas')
    .insert(rows)
    .select('*');

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaPreguntaRow[], error: null };
}

export async function deletePreguntaAction(
  preguntaId: string,
  pruebaId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { error: 'Sin permisos suficientes' };

  const prueba = await getPruebaForEmpresa(
    supabase,
    pruebaId,
    ctx.membership.empresa_id
  );
  if (!prueba) return { error: 'Prueba no encontrada' };

  const { error } = await supabase
    .from('empresa_preguntas')
    .delete()
    .eq('id', preguntaId)
    .eq('prueba_id', pruebaId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function reorderPreguntasAction(
  pruebaId: string,
  orderedIds: string[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { error: 'Sin permisos suficientes' };

  const prueba = await getPruebaForEmpresa(
    supabase,
    pruebaId,
    ctx.membership.empresa_id
  );
  if (!prueba) return { error: 'Prueba no encontrada' };

  for (let index = 0; index < orderedIds.length; index += 1) {
    const { error } = await supabase
      .from('empresa_preguntas')
      .update({ position: index })
      .eq('id', orderedIds[index])
      .eq('prueba_id', pruebaId);
    if (error) return { error: error.message };
  }

  return { error: null };
}

export async function listPreguntasAction(pruebaId: string): Promise<{
  data: EmpresaPreguntaRow[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: null, error: ctx.error };

  const prueba = await getPruebaForEmpresa(
    supabase,
    pruebaId,
    ctx.membership.empresa_id
  );
  if (!prueba) return { data: null, error: 'Prueba no encontrada' };

  const { data, error } = await supabase
    .from('empresa_preguntas')
    .select('*')
    .eq('prueba_id', pruebaId)
    .order('position', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaPreguntaRow[], error: null };
}

// ── invitaciones ──────────────────────────────────────────────────────

function generateInvitacionToken() {
  return randomBytes(32).toString('base64url');
}

export async function createPruebaInvitacionAction(payload: {
  prueba_id: string;
  candidate_email?: string;
  candidate_name?: string;
  expires_at?: string;
  max_attempts?: number;
}): Promise<{ data: EmpresaPruebaInvitacion | null; error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: null, error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { data: null, error: 'Sin permisos suficientes' };

  const prueba = await getPruebaForEmpresa(
    supabase,
    payload.prueba_id,
    ctx.membership.empresa_id
  );
  if (!prueba) return { data: null, error: 'Prueba no encontrada' };

  const { data, error } = await supabase
    .from('empresa_prueba_invitaciones')
    .insert({
      prueba_id: payload.prueba_id,
      token: generateInvitacionToken(),
      candidate_email: payload.candidate_email?.toLowerCase().trim() || null,
      candidate_name: payload.candidate_name?.trim() || null,
      expires_at: payload.expires_at ?? null,
      max_attempts: payload.max_attempts ?? 1,
      created_by: ctx.user.id,
    })
    .select('*')
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaPruebaInvitacion, error: null };
}

export async function revokePruebaInvitacionAction(
  invitacionId: string,
  pruebaId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { error: ctx.error };
  if (!isAdminRole(ctx.membership.role))
    return { error: 'Sin permisos suficientes' };

  const prueba = await getPruebaForEmpresa(
    supabase,
    pruebaId,
    ctx.membership.empresa_id
  );
  if (!prueba) return { error: 'Prueba no encontrada' };

  const { error } = await supabase
    .from('empresa_prueba_invitaciones')
    .update({ status: 'revoked' })
    .eq('id', invitacionId)
    .eq('prueba_id', pruebaId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function listPruebaInvitacionesAction(pruebaId: string): Promise<{
  data: EmpresaPruebaInvitacion[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: null, error: ctx.error };

  const prueba = await getPruebaForEmpresa(
    supabase,
    pruebaId,
    ctx.membership.empresa_id
  );
  if (!prueba) return { data: null, error: 'Prueba no encontrada' };

  const { data, error } = await supabase
    .from('empresa_prueba_invitaciones')
    .select('*')
    .eq('prueba_id', pruebaId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaPruebaInvitacion[], error: null };
}

// ── resultados ────────────────────────────────────────────────────────

export async function listIntentosAction(pruebaId: string): Promise<{
  data: EmpresaIntentoSummary[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const ctx = await requireAuthenticatedMember(supabase);
  if (!ctx.ok) return { data: null, error: ctx.error };

  const prueba = await getPruebaForEmpresa(
    supabase,
    pruebaId,
    ctx.membership.empresa_id
  );
  if (!prueba) return { data: null, error: 'Prueba no encontrada' };

  const { data, error } = await supabase
    .from('empresa_intentos')
    .select('*')
    .eq('prueba_id', pruebaId)
    .order('submitted_at', { ascending: false, nullsFirst: false });

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaIntentoSummary[], error: null };
}
