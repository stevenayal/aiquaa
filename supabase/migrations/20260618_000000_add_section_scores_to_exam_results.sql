ALTER TABLE exam_results
  ADD COLUMN IF NOT EXISTS section_scores JSONB;
