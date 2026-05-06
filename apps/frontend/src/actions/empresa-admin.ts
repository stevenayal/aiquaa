'use server';

import { createClient } from '@/lib/supabase/server';

export type EmpresaMemberRole = 'owner' | 'admin' | 'member';
export type EmpresaMemberStatus = 'pending' | 'active' | 'disabled';

export interface Empresa {
  id: string;
  ruc: string | null;
  razon_social: string;
  nombre_comercial: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmpresaMiembro {
  id: string;
  empresa_id: string;
  user_id: string;
  role: EmpresaMemberRole;
  status: EmpresaMemberStatus;
  invited_at: string;
  joined_at: string | null;
  profiles: { full_name: string; email: string | null } | null;
}

// ── read ──────────────────────────────────────────────────────────────

export async function getMyEmpresaAction(): Promise<{
  data: Empresa | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: 'No autenticado' };

  const { data, error } = await supabase.from('empresas').select('*').single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getMyMembershipAction() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: 'No autenticado' };

  const { data, error } = await supabase
    .from('empresa_miembros')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return { data: null, error: null }; // no membership → not an error
  return { data, error: null };
}

export async function getEmpresaMembersAction(): Promise<{
  data: EmpresaMiembro[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: 'No autenticado' };

  const { data, error } = await supabase
    .from('empresa_miembros')
    .select('*, profiles(full_name, email)')
    .order('role', { ascending: true })
    .order('joined_at', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data as EmpresaMiembro[], error: null };
}

// ── invite / manage ───────────────────────────────────────────────────

export async function findUserForInviteAction(email: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: 'No autenticado' };

  const { data, error } = await supabase.rpc('find_user_for_invite', {
    p_email: email.toLowerCase().trim(),
  });

  if (error) return { data: null, error: error.message };
  if (!data || data.length === 0) return { data: null, error: null }; // user not found
  return { data: data[0], error: null };
}

export async function inviteMemberAction(
  userId: string,
  role: EmpresaMemberRole = 'member',
  activateDirectly = false
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'No autenticado' };

  // Get caller's empresa_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single();

  if (!profile?.empresa_id) return { error: 'No pertenecés a ninguna empresa' };

  const { error } = await supabase.from('empresa_miembros').insert({
    empresa_id: profile.empresa_id,
    user_id: userId,
    role,
    status: activateDirectly ? 'active' : 'pending',
    invited_by: user.id,
    joined_at: activateDirectly ? new Date().toISOString() : null,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateMemberStatusAction(
  memberId: string,
  status: EmpresaMemberStatus
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'No autenticado' };

  const update: Record<string, unknown> = { status };
  if (status === 'active') update.joined_at = new Date().toISOString();

  const { error } = await supabase
    .from('empresa_miembros')
    .update(update)
    .eq('id', memberId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateMemberRoleAction(
  memberId: string,
  role: EmpresaMemberRole
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('empresa_miembros')
    .update({ role })
    .eq('id', memberId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function removeMemberAction(memberId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('empresa_miembros')
    .delete()
    .eq('id', memberId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateEmpresaAction(data: {
  ruc?: string;
  razon_social?: string;
  nombre_comercial?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'No autenticado' };

  const { error } = await supabase.from('empresas').update(data);

  if (error) return { error: error.message };
  return { success: true };
}

// ── invitation acceptance (called by invited user) ────────────────────

export async function getMyPendingInvitationAction() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { data: null, error: null };

  const { data, error } = await supabase
    .from('empresa_miembros')
    .select('*, empresas(razon_social, nombre_comercial)')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (error) return { data: null, error: null };
  return { data, error: null };
}

export async function acceptInvitationAction() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'No autenticado' };

  // Get the pending invite
  const { data: invite, error: invErr } = await supabase
    .from('empresa_miembros')
    .select('id, empresa_id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (invErr || !invite) return { error: 'No hay invitación pendiente' };

  // Accept the invite
  const { error: acceptErr } = await supabase
    .from('empresa_miembros')
    .update({ status: 'active', joined_at: new Date().toISOString() })
    .eq('id', invite.id);

  if (acceptErr) return { error: acceptErr.message };

  // Link profile to empresa + set audience to 'empresa'
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ empresa_id: invite.empresa_id, audience: 'empresa' })
    .eq('id', user.id);

  if (profileErr) return { error: profileErr.message };

  return { success: true };
}

export async function declineInvitationAction() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('empresa_miembros')
    .delete()
    .eq('user_id', user.id)
    .eq('status', 'pending');

  if (error) return { error: error.message };
  return { success: true };
}
