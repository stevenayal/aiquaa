/**
 * @aiquaa/allpairs-core
 *
 * Core pairwise test generation library
 */

export {
  generatePairwise,
  calculateCoverage,
} from './generatePairwise';

export {
  validatePairwiseInput,
  assertValidInput,
} from './validate';

export {
  toCsv,
  fromCsv,
} from './csv';

export {
  parseJsonOrYaml,
  toJson,
  toYaml,
  toObjectFormat,
} from './convert';

export type {
  PairwiseInput,
  PairwiseResult,
  ValidationError,
  CsvExportOptions,
} from './types';
