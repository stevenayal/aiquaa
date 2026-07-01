'use server';

import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';

// Email sending is gated by EMAIL_SENDING_ENABLED so it can be turned on per
// environment without code changes. Set to 'true' in Vercel env vars when Resend
// is configured (RESEND_API_KEY + RESEND_FROM_EMAIL).
const EMAIL_SENDING_ENABLED = process.env.EMAIL_SENDING_ENABLED === 'true';

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

  const inv = data as EmpresaInvitacion;

  // Send email when EMAIL_SENDING_ENABLED=true; track result in DB.
  if (EMAIL_SENDING_ENABLED && inv.token) {
    const { data: empresaRow } = await supabase
      .from('empresas')
      .select('razon_social, nombre_comercial')
      .eq('id', inv.empresa_id)
      .single();

    const empresaNombre =
      empresaRow?.nombre_comercial || empresaRow?.razon_social || 'Una empresa';

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiquaa.com';
    const link = `${siteUrl}/invitaciones/${inv.token}`;
    const candidateName = inv.candidate_name ?? inv.candidate_email;

    const subject = `${empresaNombre} te invita a rendir una evaluación técnica QA`;
    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827">Hola, ${candidateName}</h2>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px">
      <strong>${empresaNombre}</strong> te invita a rendir una evaluación técnica QA en AIQUAA.
    </p>
    ${inv.message ? `<blockquote style="border-left:3px solid #6366f1;margin:0 0 16px;padding:8px 16px;color:#4b5563;font-size:13px">${inv.message}</blockquote>` : ''}
    <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;margin-bottom:16px">
      Ver mi invitación →
    </a>
    <p style="color:#9ca3af;font-size:12px;margin:0">
      O copiá este enlace: ${link}
    </p>
    <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0" />
    <p style="color:#9ca3af;font-size:11px;margin:0">
      AIQUAA — Plataforma de evaluación técnica QA para LATAM
    </p>
  </div>
</body>
</html>`;

    const { error: emailErr } = await sendEmail(inv.candidate_email, subject, html);

    const { data: updated } = await supabase
      .from('empresa_invitaciones')
      .update({
        email_sent: !emailErr,
        email_error: emailErr ?? null,
      })
      .eq('id', inv.id)
      .select('*, hiring_processes(position_name, code)')
      .single();

    if (updated) return { data: updated as EmpresaInvitacion, error: null };
  }

  return { data: inv, error: null };
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
