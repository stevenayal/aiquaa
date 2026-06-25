'use server';

import { createClient } from '@/lib/supabase/server';

export type ProspectStatus =
  | 'pendiente'
  | 'invitado'
  | 'rendido'
  | 'descartado';
export type ProspectSource = 'linkedin' | 'referido' | 'bolsa' | 'otro';

export interface Prospect {
  id: string;
  process_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cv_url: string | null;
  source: string | null;
  notes: string | null;
  status: ProspectStatus;
  created_by: string;
  created_at: string;
}

export interface ProspectWithProcess extends Prospect {
  hiring_processes: {
    id: string;
    position_name: string;
    code: string;
  };
}

export async function getEmpresaProspectsAction(
  status?: ProspectStatus
): Promise<{ data: ProspectWithProcess[] | null; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: 'No autenticado' };

  let query = supabase
    .from('prospects')
    .select('*, hiring_processes!inner(id, position_name, code)')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as ProspectWithProcess[] };
}

export async function getProspectsForProcessAction(
  process_id: string
): Promise<{ data: Prospect[] | null; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: 'No autenticado' };

  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('process_id', process_id)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [] };
}

export async function addProspectAction(payload: {
  process_id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
  cv_base64?: string;
  cv_filename?: string;
}): Promise<{ data: Prospect | null; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: 'No autenticado' };

  // Verify process belongs to this user
  const { data: proc, error: procError } = await supabase
    .from('hiring_processes')
    .select('id')
    .eq('id', payload.process_id)
    .eq('created_by', user.id)
    .single();

  if (procError || !proc) return { data: null, error: 'Proceso no encontrado' };

  // Insert prospect first to get the ID
  const { data: prospect, error: insertError } = await supabase
    .from('prospects')
    .insert({
      process_id: payload.process_id,
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
      source: payload.source || null,
      notes: payload.notes || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (insertError || !prospect)
    return { data: null, error: insertError?.message ?? 'Error al guardar' };

  // Upload CV if provided
  if (payload.cv_base64 && payload.cv_filename) {
    const ext = payload.cv_filename.split('.').pop() ?? 'pdf';
    const path = `${user.id}/${prospect.id}.${ext}`;
    const bytes = Buffer.from(payload.cv_base64, 'base64');

    const { error: storageError } = await supabase.storage
      .from('prospect-cvs')
      .upload(path, bytes, {
        contentType:
          ext === 'pdf' ? 'application/pdf' : 'application/octet-stream',
        upsert: true,
      });

    if (!storageError) {
      await supabase
        .from('prospects')
        .update({ cv_url: path })
        .eq('id', prospect.id);
      prospect.cv_url = path;
    }
  }

  return { data: prospect };
}

export async function updateProspectStatusAction(
  prospect_id: string,
  status: ProspectStatus
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('prospects')
    .update({ status })
    .eq('id', prospect_id)
    .eq('created_by', user.id);

  if (error) return { error: error.message };
  return {};
}

export async function deleteProspectAction(
  prospect_id: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  // Get cv_url to delete from storage
  const { data: prospect } = await supabase
    .from('prospects')
    .select('cv_url')
    .eq('id', prospect_id)
    .eq('created_by', user.id)
    .single();

  if (prospect?.cv_url) {
    await supabase.storage.from('prospect-cvs').remove([prospect.cv_url]);
  }

  const { error } = await supabase
    .from('prospects')
    .delete()
    .eq('id', prospect_id)
    .eq('created_by', user.id);

  if (error) return { error: error.message };
  return {};
}

export async function getCvSignedUrlAction(
  cv_path: string
): Promise<{ url: string | null; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { url: null, error: 'No autenticado' };

  const { data, error } = await supabase.storage
    .from('prospect-cvs')
    .createSignedUrl(cv_path, 300); // 5 min expiry

  if (error) return { url: null, error: error.message };
  return { url: data.signedUrl };
}
