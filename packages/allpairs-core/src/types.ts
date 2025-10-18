/**
 * Input structure for pairwise generation
 */
export interface PairwiseInput {
  /** Column names/labels */
  labels: string[];
  /** Values for each parameter (parameters[i] corresponds to labels[i]) */
  parameters: string[][];
}

/**
 * Result of pairwise generation
 */
export interface PairwiseResult {
  /** Column headers (same as input labels) */
  headers: string[];
  /** Generated test cases (each row is a test case) */
  rows: string[][];
}

/**
 * Validation error with details
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * CSV export options
 */
export interface CsvExportOptions {
  /** Include row number column (default: true) */
  includeCounter?: boolean;
  /** Counter column name (default: '#') */
  counterLabel?: string;
  /** Delimiter (default: ',') */
  delimiter?: string;
}
