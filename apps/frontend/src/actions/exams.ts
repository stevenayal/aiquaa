'use server';

import { createClient } from '@/lib/supabase/server';

interface SaveExamResultPayload {
  exam_type: 'git' | 'istqb' | 'performance' | 'test-app';
  exam_mode: 'exam' | 'training';
  participant_name?: string;
  participant_email?: string;
  candidate_id?: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  passing_score?: number;
  passed: boolean;
  percentage: number;
  time_spent: number;
  answers?: object;
  // Git & Performance
  github_profile?: string;
  exam_purpose?: string;
  company_name?: string;
  // ISTQB
  model?: string;
  language?: string;
  // Analysis
  learning_objectives?: object;
  // Hiring process
  process_code?: string;
  // Extra structured data (bugs, sections, etc.)
  metadata?: object;
}

export async function saveExamResultAction(payload: SaveExamResultPayload) {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const { error } = await supabase.from('exam_results').insert({
    user_id: user.id,
    ...payload,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getLeaderboardAction(examType: 'git' | 'istqb' | 'performance', limit = 20) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_exam_type: examType,
    p_limit: limit,
  });
  if (error) return { error: error.message, data: null };
  return { data };
}

export async function getExamResultsAction() {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  const { data, error } = await supabase
    .from('exam_results')
    .select('id, exam_type, exam_mode, score, total_questions, passing_score, passed, percentage, time_spent, model, language, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return { error: error.message, data: null };
  return { data };
}
