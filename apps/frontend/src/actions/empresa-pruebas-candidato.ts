'use server';

// Candidate-facing actions for empresa_pruebas — no session, validated by
// invitation token, using the service-role client (bypasses RLS). Candidates
// never touch empresa_intentos/empresa_preguntas directly.

import { createAdminClient } from '@/lib/supabase/admin';
import {
  scoreEmpresaIntento,
  type EmpresaPregunta as ScoringPregunta,
} from '@/actions/lib/empresa-scoring';
import type { EmpresaPruebaQuestionType } from '@/actions/empresa-pruebas';

const SUBMIT_GRACE_MS = 2 * 60 * 1000; // 2 min soft margin over duration_minutes

interface InvitacionRow {
  id: string;
  prueba_id: string;
  token: string;
  candidate_email: string | null;
  candidate_name: string | null;
  expires_at: string | null;
  max_attempts: number;
  status: 'active' | 'revoked';
}

interface PruebaRow {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  duration_minutes: number | null;
  is_active: boolean;
}

interface PreguntaRow {
  id: string;
  position: number;
  question_type: EmpresaPruebaQuestionType;
  prompt: string;
  options: unknown;
  correct_answer: unknown;
  expected_keywords: string[] | null;
  points: number;
}

export interface PublicPregunta {
  id: string;
  position: number;
  question_type: EmpresaPruebaQuestionType;
  prompt: string;
  options: unknown;
}

async function resolveInvitacion(
  adminClient: ReturnType<typeof createAdminClient>,
  token: string
): Promise<
  { invitacion: InvitacionRow; prueba: PruebaRow } | { error: string }
> {
  const { data: invitacion, error: invErr } = await adminClient
    .from('empresa_prueba_invitaciones')
    .select(
      'id, prueba_id, token, candidate_email, candidate_name, expires_at, max_attempts, status'
    )
    .eq('token', token)
    .maybeSingle();

  if (invErr || !invitacion) return { error: 'not_found' };
  if (invitacion.status !== 'active') return { error: 'revoked' };
  if (
    invitacion.expires_at &&
    new Date(invitacion.expires_at).getTime() < Date.now()
  )
    return { error: 'expired' };

  const { data: prueba, error: pruebaErr } = await adminClient
    .from('empresa_pruebas')
    .select('id, title, description, level, duration_minutes, is_active')
    .eq('id', invitacion.prueba_id)
    .maybeSingle();

  if (pruebaErr || !prueba || !prueba.is_active) return { error: 'not_found' };

  return {
    invitacion: invitacion as InvitacionRow,
    prueba: prueba as PruebaRow,
  };
}

function stripAnswerKey(row: PreguntaRow): PublicPregunta {
  return {
    id: row.id,
    position: row.position,
    question_type: row.question_type,
    prompt: row.prompt,
    options: row.question_type === 'multiple_choice' ? row.options : undefined,
  };
}

export async function getPruebaByTokenAction(token: string): Promise<{
  data: {
    prueba: PruebaRow;
    preguntas: PublicPregunta[];
    candidate_name: string | null;
    candidate_email: string | null;
  } | null;
  error: string | null;
}> {
  const adminClient = createAdminClient();
  const resolved = await resolveInvitacion(adminClient, token);
  if ('error' in resolved) return { data: null, error: resolved.error };
  const { invitacion, prueba } = resolved;

  const { count } = await adminClient
    .from('empresa_intentos')
    .select('id', { count: 'exact', head: true })
    .eq('invitacion_id', invitacion.id)
    .not('submitted_at', 'is', null);

  if ((count ?? 0) >= invitacion.max_attempts)
    return { data: null, error: 'no_attempts_left' };

  const { data: preguntas, error: preguntasErr } = await adminClient
    .from('empresa_preguntas')
    .select(
      'id, position, question_type, prompt, options, correct_answer, expected_keywords, points'
    )
    .eq('prueba_id', prueba.id)
    .order('position', { ascending: true });

  if (preguntasErr) return { data: null, error: preguntasErr.message };

  return {
    data: {
      prueba,
      preguntas: (preguntas as PreguntaRow[]).map(stripAnswerKey),
      candidate_name: invitacion.candidate_name,
      candidate_email: invitacion.candidate_email,
    },
    error: null,
  };
}

export async function startIntentoAction(
  token: string,
  candidateInfo: { candidate_name?: string; candidate_email?: string }
): Promise<{ data: { intentoId: string } | null; error: string | null }> {
  const adminClient = createAdminClient();
  const resolved = await resolveInvitacion(adminClient, token);
  if ('error' in resolved) return { data: null, error: resolved.error };
  const { invitacion, prueba } = resolved;

  const { count } = await adminClient
    .from('empresa_intentos')
    .select('id', { count: 'exact', head: true })
    .eq('invitacion_id', invitacion.id)
    .not('submitted_at', 'is', null);

  if ((count ?? 0) >= invitacion.max_attempts)
    return { data: null, error: 'no_attempts_left' };

  const { data, error } = await adminClient
    .from('empresa_intentos')
    .insert({
      prueba_id: prueba.id,
      invitacion_id: invitacion.id,
      candidate_name:
        invitacion.candidate_name ??
        candidateInfo.candidate_name?.trim() ??
        null,
      candidate_email:
        invitacion.candidate_email ??
        candidateInfo.candidate_email?.toLowerCase().trim() ??
        null,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) return { data: null, error: error.message };
  return { data: { intentoId: data.id as string }, error: null };
}

export async function submitIntentoAction(
  token: string,
  intentoId: string,
  answers: Record<string, unknown>
): Promise<{ error: string | null }> {
  const adminClient = createAdminClient();
  const resolved = await resolveInvitacion(adminClient, token);
  if ('error' in resolved) return { error: resolved.error };
  const { invitacion, prueba } = resolved;

  const { data: intento, error: intentoErr } = await adminClient
    .from('empresa_intentos')
    .select('id, invitacion_id, started_at, submitted_at')
    .eq('id', intentoId)
    .eq('invitacion_id', invitacion.id)
    .maybeSingle();

  if (intentoErr || !intento) return { error: 'not_found' };
  if (intento.submitted_at) return { error: null }; // idempotent: already scored

  if (prueba.duration_minutes && intento.started_at) {
    const deadline =
      new Date(intento.started_at).getTime() +
      prueba.duration_minutes * 60 * 1000 +
      SUBMIT_GRACE_MS;
    if (Date.now() > deadline) return { error: 'time_expired' };
  }

  const { data: preguntas, error: preguntasErr } = await adminClient
    .from('empresa_preguntas')
    .select('id, question_type, correct_answer, expected_keywords, points')
    .eq('prueba_id', prueba.id);

  if (preguntasErr) return { error: preguntasErr.message };

  const scoringPreguntas: ScoringPregunta[] = (preguntas ?? []).map((row) => ({
    id: row.id,
    question_type: row.question_type,
    correct_answer: row.correct_answer,
    expected_keywords: row.expected_keywords,
    points: row.points,
  }));

  const summary = scoreEmpresaIntento(scoringPreguntas, answers);

  const { error: updateErr } = await adminClient
    .from('empresa_intentos')
    .update({
      submitted_at: new Date().toISOString(),
      answers,
      score: summary.score,
      max_score: summary.maxScore,
      breakdown: summary.breakdown,
    })
    .eq('id', intentoId);

  if (updateErr) return { error: updateErr.message };
  return { error: null };
}
