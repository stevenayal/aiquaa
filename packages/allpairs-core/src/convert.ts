import * as yaml from 'js-yaml';
import { PairwiseInput } from './types';

/**
 * Parse JSON or YAML text to PairwiseInput
 *
 * Supports multiple formats:
 * 1. Direct format: { labels: [...], parameters: [[...], [...]] }
 * 2. Object format: { "Label1": ["val1", "val2"], "Label2": [...] }
 *
 * @param text - JSON or YAML text
 * @returns Parsed pairwise input
 */
export function parseJsonOrYaml(text: string): PairwiseInput {
  let parsed: any;

  // Try JSON first
  try {
    parsed = JSON.parse(text);
  } catch (jsonError) {
    // Try YAML
    try {
      parsed = yaml.load(text);
    } catch (yamlError) {
      throw new Error('Invalid JSON or YAML format');
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Parsed data must be an object');
  }

  // Check if it's in direct format
  if ('labels' in parsed && 'parameters' in parsed) {
    return {
      labels: parsed.labels,
      parameters: parsed.parameters,
    };
  }

  // Convert object format to array format
  const labels: string[] = [];
  const parameters: string[][] = [];

  for (const [key, value] of Object.entries(parsed)) {
    if (!Array.isArray(value)) {
      throw new Error(`Value for "${key}" must be an array`);
    }

    labels.push(key);
    parameters.push(value as string[]);
  }

  return { labels, parameters };
}

/**
 * Convert PairwiseInput to JSON string
 */
export function toJson(input: PairwiseInput, pretty: boolean = true): string {
  return JSON.stringify(input, null, pretty ? 2 : 0);
}

/**
 * Convert PairwiseInput to YAML string
 */
export function toYaml(input: PairwiseInput): string {
  return yaml.dump(input, {
    indent: 2,
    lineWidth: -1,
  });
}

/**
 * Convert PairwiseInput to object format (label -> values)
 */
export function toObjectFormat(input: PairwiseInput): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  input.labels.forEach((label, index) => {
    result[label] = input.parameters[index];
  });

  return result;
}
