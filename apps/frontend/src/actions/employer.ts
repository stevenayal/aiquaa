'use server';

import { createClient } from '@/lib/supabase/server';

export interface HiringProcess {
  id: string;
  code: string;
  created_by: string;
  company_name: string;
  position_name: string;
  description?: string;
  exam_types: string[];
  status: 'draft' | 'active' | 'closed';
  expires_at?: string;
  created_at: string;
}

export interface ProcessCandidate {
  id: string;
  user_id: string;
  participant_name?: string;
  exam_type: string;
  score: number;
  percentage: number;
  passed: boolean;
  time_spent: number;
  created_at: string;
  profiles?: { display_name?: string; email?: string };
}

function generateCode(company: string): string {
  const slug = company.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${slug}-${year}-${rand}`;
}

export async function createHiringProcessAction(payload: {
  company_name: string;
  position_name: string;
  description?: string;
  exam_types: string[];
  expires_at?: string;
}) {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const code = generateCode(payload.company_name);

  const { data, error } = await supabase
    .from('hiring_processes')
    .insert({ ...payload, code, created_by: user.id, status: 'active' })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function getMyProcessesAction() {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  const { data, error } = await supabase
    .from('hiring_processes')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function getProcessCandidatesAction(code: string) {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null, process: null };

  const { data: process, error: procError } = await supabase
    .from('hiring_processes')
    .select('*')
    .eq('code', code)
    .eq('created_by', user.id)
    .single();

  if (procError || !process) return { error: 'Proceso no encontrado', data: null, process: null };

  const { data, error } = await supabase
    .from('exam_results')
    .select('id, user_id, participant_name, exam_type, score, percentage, passed, time_spent, created_at')
    .eq('process_code', code)
    .order('percentage', { ascending: false });

  if (error) return { error: error.message, data: null, process };
  return { data, process };
}

export async function validateProcessCodeAction(code: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hiring_processes')
    .select('code, company_name, position_name, status')
    .eq('code', code.trim().toUpperCase())
    .eq('status', 'active')
    .single();

  if (error || !data) return { valid: false, process: null };
  return { valid: true, process: data };
}

export async function updateProcessStatusAction(code: string, status: 'active' | 'closed') {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('hiring_processes')
    .update({ status })
    .eq('code', code)
    .eq('created_by', user.id);

  if (error) return { error: error.message };
  return { success: true };
}
