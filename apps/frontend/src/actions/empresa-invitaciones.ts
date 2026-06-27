'use server';

import { createClient } from '@/lib/supabase/server';

// #197 / #204 / #177: extension point for candidate invitation emails.
// Email sending stays OFF until EMAIL_SENDING_ENABLED is set; until then this
// is a no-op that reports "not sent" so the invitation is still persisted with
// an accurate email_sent=false. Do NOT connect Resend here yet.
const EMAIL_SENDING_ENABLED = process.env.EMAIL_SENDING_ENABLED === 'true';

async function sendInvitacionEmail(_data: {
  candidate_email: string;
  candidate_name: string | null;
  message: string | null;
  token: string;
  process_id: string | null;
}): Promise<{ sent: boolean; error?: string }> {
  if (!EMAIL_SENDING_ENABLED) {
    return { sent: false };
  }
  // TODO(#197): wire Resend / backend mailer here and return { sent: true }.
  return { sent: false, error: 'Email sending not configured' };
}

export interface EmpresaInvitacion {
  id: string;
  empresa_id: string;
  process_id: string | null;
  invited_by: string;
  candidate_email: string;
  candidate_name: string | null;
  message: string | null;
  status: 'pendiente' | 'vista' | 'completada' | 'rechazada';
  token: string;
  sent_at: string;
  viewed_at: string | null;
  completed_at: string | null;
  email_sent: boolean;
  email_error: string | null;
  created_at: string;
  hiring_processes?: { position_name: string; code: string } | null;
  profiles?: { display_name: string } | null;
}

async function getCallerEmpresaId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase
    .from('empresa_miembros')
    .select('empresa_id, role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  return data;
}

export async function getEmpresaInvitacionesAction(): Promise<{
  data: EmpresaInvitacion[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: 'No autenticado' };

  const membership = await getCallerEmpresaId(supabase, user.id);
  if (!membership) return { data: null, error: 'Sin membresía activa' };

  const { data, error } = await supabase
    .from('empresa_invitaciones')
    .select('*, hiring_processes(position_name, code)')
    .eq('empresa_id', membership.empresa_id)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaInvitacion[], error: null };
}

export async function createInvitacionAction(payload: {
  candidate_email: string;
  candidate_name?: string;
  process_id?: string;
  message?: string;
}): Promise<{ data: EmpresaInvitacion | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: 'No autenticado' };

  const membership = await getCallerEmpresaId(supabase, user.id);
  if (!membership) return { data: null, error: 'Sin membresía activa' };

  // Check for duplicate active invitation
  const { data: existing } = await supabase
    .from('empresa_invitaciones')
    .select('id, status')
    .eq('empresa_id', membership.empresa_id)
    .eq('candidate_email', payload.candidate_email.toLowerCase().trim())
    .in('status', ['pendiente', 'vista'])
    .maybeSingle();

  if (existing)
    return {
      data: null,
      error: 'Ya existe una invitación activa para ese email',
    };

  const { data, error } = await supabase
    .from('empresa_invitaciones')
    .insert({
      empresa_id: membership.empresa_id,
      process_id: payload.process_id ?? null,
      invited_by: user.id,
      candidate_email: payload.candidate_email.toLowerCase().trim(),
      candidate_name: payload.candidate_name?.trim() ?? null,
      message: payload.message?.trim() ?? null,
      status: 'pendiente',
    })
    .select('*, hiring_processes(position_name, code)')
    .single();

  if (error) return { data: null, error: error.message };

  // #197/#204: attempt to notify the candidate. No-op while email sending is
  // disabled — the invitation is already persisted with email_sent=false.
  const invitacion = data as EmpresaInvitacion;
  const emailResult = await sendInvitacionEmail({
    candidate_email: invitacion.candidate_email,
    candidate_name: invitacion.candidate_name,
    message: invitacion.message,
    token: invitacion.token,
    process_id: invitacion.process_id,
  });

  if (emailResult.sent || emailResult.error) {
    const { data: updated } = await supabase
      .from('empresa_invitaciones')
      .update({
        email_sent: emailResult.sent,
        email_error: emailResult.error ?? null,
      })
      .eq('id', invitacion.id)
      .select('*, hiring_processes(position_name, code)')
      .single();
    if (updated) return { data: updated as EmpresaInvitacion, error: null };
  }

  return { data: invitacion, error: null };
}

export async function cancelInvitacionAction(invitacionId: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'No autenticado' };

  const membership = await getCallerEmpresaId(supabase, user.id);
  if (!membership || !['owner', 'admin'].includes(membership.role))
    return { error: 'Sin permisos' };

  const { error } = await supabase
    .from('empresa_invitaciones')
    .delete()
    .eq('id', invitacionId)
    .eq('empresa_id', membership.empresa_id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function getPendingInvitacionesCountAction(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const membership = await getCallerEmpresaId(supabase, user.id);
  if (!membership) return 0;

  const { count } = await supabase
    .from('empresa_invitaciones')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', membership.empresa_id)
    .in('status', ['pendiente', 'vista']);

  return count ?? 0;
}
