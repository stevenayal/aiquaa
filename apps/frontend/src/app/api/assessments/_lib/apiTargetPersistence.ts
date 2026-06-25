const API_TARGET_COLUMN = 'api_target';

type SupabaseLike = {
  from: (table: string) => any;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const ATTEMPT_SELECT_WITH_API_TARGET =
  'id, status, started_at, aiquaa_user_id, candidate_name, candidate_email, process_code, api_target';

const ATTEMPT_SELECT_LEGACY =
  'id, status, started_at, aiquaa_user_id, candidate_name, candidate_email, process_code';

export function isMissingApiTargetColumnError(
  error: SupabaseErrorLike | null | undefined
) {
  if (!error) return false;

  const text = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    (error.code === '42703' || error.code === 'PGRST204') &&
    text.includes(API_TARGET_COLUMN)
  );
}

export async function insertAttemptWithApiTargetFallback(
  supabase: SupabaseLike,
  payload: Record<string, unknown>
) {
  const result = await supabase
    .from('qac_attempts')
    .insert(payload)
    .select('id')
    .single();

  if (!isMissingApiTargetColumnError(result.error)) {
    return result;
  }

  const { [API_TARGET_COLUMN]: _apiTarget, ...legacyPayload } = payload;

  return supabase
    .from('qac_attempts')
    .insert(legacyPayload)
    .select('id')
    .single();
}

export async function selectAttemptForSubmitWithApiTargetFallback(
  supabase: SupabaseLike,
  attemptId: number
) {
  const result = await supabase
    .from('qac_attempts')
    .select(ATTEMPT_SELECT_WITH_API_TARGET)
    .eq('id', attemptId)
    .single();

  if (!isMissingApiTargetColumnError(result.error)) {
    return result;
  }

  return supabase
    .from('qac_attempts')
    .select(ATTEMPT_SELECT_LEGACY)
    .eq('id', attemptId)
    .single();
}
