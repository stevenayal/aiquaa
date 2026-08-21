'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type BugReviewItem = {
  approved: boolean;
  evaluatorNotes: string;
  qualityScore: number; // 1-5, calidad del reporte de este bug (no solo aprobado/rechazado)
};

type ReviewData = {
  // Sólo aplica al bug hunt de test-app; las pruebas de desarrollo se corrigen
  // con un puntaje global y no tienen items individuales.
  bugs?: Record<string, BugReviewItem>;
  overallNotes: string;
  adjustedScore: number | null;
};

type BugImageEvidence = {
  id: string;
  fileName: string;
  base64Data?: string;
  storageBucket?: string;
  storagePath?: string;
  signedUrl?: string;
  uploadError?: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export type ExamDetail = {
  id: string;
  participant_name: string | null;
  participant_email: string | null;
  user_id: string | null;
  exam_type: string;
  score: number;
  total_questions: number;
  passing_score: number | null;
  percentage: number;
  passed: boolean;
  time_spent: number;
  created_at: string;
  process_code: string | null;
  review_status: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  metadata: BugHuntMetadata | DesarrolloMetadata | null;
  review_data: ReviewData | null;
};

/** Entrega de una prueba de desarrollo: el candidato manda el link del repo. */
export type DesarrolloMetadata = {
  challengeId: string;
  repoUrl: string;
  githubUser?: string;
  notes?: string;
  submittedAt?: string;
};

type BugHuntMetadata = {
  bugs: Array<{
    id: string;
    title: string;
    description: string;
    stepsToReproduce: string[];
    expectedResult: string;
    actualResult: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    category: string;
    evidence: string;
    images?: BugImageEvidence[];
    foundAt: string;
  }>;
  exploredSections: string[];
  bugCount: number;
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
};

export async function getExamDetailAction(
  resultId: string
): Promise<{ data: ExamDetail | null; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { data: null, error: 'No autenticado' };

  const { data, error } = await supabase
    .from('exam_results')
    .select(
      `id, participant_name, participant_email, user_id, exam_type,
       score, total_questions, passing_score, percentage, passed, time_spent,
       created_at, process_code, review_status, reviewed_at, reviewed_by,
       metadata, review_data`
    )
    .eq('id', resultId)
    .single();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: 'Resultado no encontrado' };

  const detail = data as unknown as ExamDetail;
  const bugs =
    detail.metadata && 'bugs' in detail.metadata ? detail.metadata.bugs : [];
  const images = bugs.flatMap((bug) => bug.images ?? []);
  const storageImages = images.filter(
    (image) => image.storageBucket && image.storagePath
  );

  if (storageImages.length > 0) {
    try {
      const admin = createAdminClient();
      await Promise.all(
        storageImages.map(async (image) => {
          const { data: signed } = await admin.storage
            .from(image.storageBucket!)
            .createSignedUrl(image.storagePath!, 60 * 60);
          image.signedUrl = signed?.signedUrl;
        })
      );
    } catch (storageError) {
      console.warn('[exam-review] evidence signed URL failed', storageError);
    }
  }

  return { data: detail, error: null };
}

export async function saveExamReviewAction(
  resultId: string,
  reviewData: ReviewData,
  status: 'in_review' | 'reviewed',
  finalScore?: { score: number; percentage: number; passed: boolean }
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'No autenticado' };

  const updateData: Record<string, unknown> = {
    review_data: reviewData,
    review_status: status,
    reviewed_by: user.id,
  };

  if (status === 'reviewed') {
    updateData.reviewed_at = new Date().toISOString();
    // El score automático es heurístico (ver saveExamResultAction); al
    // finalizar la revisión, el puntaje corregido por el evaluador pasa a
    // ser el oficial en vez de quedar solo dentro de review_data.
    if (finalScore) {
      updateData.score = finalScore.score;
      updateData.percentage = finalScore.percentage;
      updateData.passed = finalScore.passed;
    }
  }

  const { error } = await supabase
    .from('exam_results')
    .update(updateData)
    .eq('id', resultId);

  if (error) return { error: error.message };

  return { error: null };
}
