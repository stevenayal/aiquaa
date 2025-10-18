import { PairwiseInput, ValidationError } from './types';

/**
 * Validates pairwise input data
 * @param input - The input to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validatePairwiseInput(input: PairwiseInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if labels exist
  if (!input.labels || !Array.isArray(input.labels)) {
    errors.push({
      field: 'labels',
      message: 'Labels must be an array',
    });
    return errors;
  }

  // Check if parameters exist
  if (!input.parameters || !Array.isArray(input.parameters)) {
    errors.push({
      field: 'parameters',
      message: 'Parameters must be an array',
    });
    return errors;
  }

  // Check length match
  if (input.labels.length !== input.parameters.length) {
    errors.push({
      field: 'length',
      message: `Labels length (${input.labels.length}) must match parameters length (${input.parameters.length})`,
    });
  }

  // Check for empty labels
  if (input.labels.length === 0) {
    errors.push({
      field: 'labels',
      message: 'At least one label is required',
    });
  }

  // Validate each parameter
  input.parameters.forEach((param, index) => {
    if (!Array.isArray(param)) {
      errors.push({
        field: `parameters[${index}]`,
        message: `Parameter at index ${index} must be an array`,
      });
      return;
    }

    if (param.length === 0) {
      errors.push({
        field: `parameters[${index}]`,
        message: `Parameter "${input.labels[index]}" must have at least one value`,
      });
    }

    // Check for duplicate values
    const uniqueValues = new Set(param);
    if (uniqueValues.size !== param.length) {
      errors.push({
        field: `parameters[${index}]`,
        message: `Parameter "${input.labels[index]}" contains duplicate values`,
      });
    }

    // Check for empty string values
    if (param.some((v) => v === '')) {
      errors.push({
        field: `parameters[${index}]`,
        message: `Parameter "${input.labels[index]}" contains empty string values`,
      });
    }
  });

  // Check for duplicate labels
  const uniqueLabels = new Set(input.labels);
  if (uniqueLabels.size !== input.labels.length) {
    errors.push({
      field: 'labels',
      message: 'Labels contain duplicates',
    });
  }

  return errors;
}

/**
 * Throws an error if validation fails
 * @param input - The input to validate
 */
export function assertValidInput(input: PairwiseInput): void {
  const errors = validatePairwiseInput(input);
  if (errors.length > 0) {
    const errorMessages = errors.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }
}
