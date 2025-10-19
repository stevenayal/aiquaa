import { PairwiseInput, PairwiseResult } from './types';
import { assertValidInput } from './validate';

/**
 * Represents a pair of (parameterIndex, value)
 */
interface Pair {
  param1: number;
  value1: string;
  param2: number;
  value2: string;
}

/**
 * Generate all possible pairs between two parameters
 */
function generatePairsForColumns(
  param1Index: number,
  values1: string[],
  param2Index: number,
  values2: string[]
): Pair[] {
  const pairs: Pair[] = [];
  for (const v1 of values1) {
    for (const v2 of values2) {
      pairs.push({
        param1: param1Index,
        value1: v1,
        param2: param2Index,
        value2: v2,
      });
    }
  }
  return pairs;
}

/**
 * Generate all pairs that need to be covered
 */
function generateAllPairs(parameters: string[][]): Set<string> {
  const allPairs = new Set<string>();

  for (let i = 0; i < parameters.length; i++) {
    for (let j = i + 1; j < parameters.length; j++) {
      const pairs = generatePairsForColumns(i, parameters[i], j, parameters[j]);
      pairs.forEach((pair) => {
        const key = `${pair.param1}:${pair.value1}|${pair.param2}:${pair.value2}`;
        allPairs.add(key);
      });
    }
  }

  return allPairs;
}

/**
 * Get pairs covered by a specific test case
 */
function getPairsCoveredByRow(row: string[]): Set<string> {
  const covered = new Set<string>();

  for (let i = 0; i < row.length; i++) {
    for (let j = i + 1; j < row.length; j++) {
      const key = `${i}:${row[i]}|${j}:${row[j]}`;
      covered.add(key);
    }
  }

  return covered;
}

/**
 * Count how many uncovered pairs would be covered by a candidate row
 */
function countNewPairsCovered(
  candidate: string[],
  uncoveredPairs: Set<string>
): number {
  const candidatePairs = getPairsCoveredByRow(candidate);
  let count = 0;

  for (const pair of candidatePairs) {
    if (uncoveredPairs.has(pair)) {
      count++;
    }
  }

  return count;
}

/**
 * Generate a candidate row by trying different value combinations
 * This is an improved greedy approach with multiple passes
 */
function generateBestCandidate(
  parameters: string[][],
  uncoveredPairs: Set<string>
): string[] {
  const numParams = parameters.length;
  const candidate: string[] = new Array(numParams);

  // Start with values that appear in most uncovered pairs
  for (let i = 0; i < numParams; i++) {
    let bestValue = parameters[i][0];
    let bestScore = 0;

    for (const value of parameters[i]) {
      // Temporarily assign this value and count uncovered pairs it would cover
      candidate[i] = value;
      const score = countNewPairsCovered(candidate, uncoveredPairs);
      if (score > bestScore) {
        bestScore = score;
        bestValue = value;
      }
    }
    candidate[i] = bestValue;
  }

  // Second pass: optimize each position again with full context
  for (let pos = 0; pos < numParams; pos++) {
    let bestValue = candidate[pos];
    let bestScore = countNewPairsCovered(candidate, uncoveredPairs);

    for (const value of parameters[pos]) {
      if (value === candidate[pos]) continue; // Skip current value

      const testCandidate = [...candidate];
      testCandidate[pos] = value;
      const score = countNewPairsCovered(testCandidate, uncoveredPairs);

      if (score > bestScore) {
        bestScore = score;
        bestValue = value;
      }
    }

    candidate[pos] = bestValue;
  }

  return candidate;
}

/**
 * Main pairwise generation algorithm
 *
 * This implements a greedy algorithm that:
 * 1. Generates all pairs that need to be covered
 * 2. Iteratively builds test cases that cover the most uncovered pairs
 * 3. Continues until all pairs are covered
 *
 * @param input - The pairwise input with labels and parameters
 * @returns The generated test cases
 */
export function generatePairwise(input: PairwiseInput): PairwiseResult {
  // Validate input
  assertValidInput(input);

  const { labels, parameters } = input;

  // Handle edge case: single parameter
  if (parameters.length === 1) {
    return {
      headers: labels,
      rows: parameters[0].map((v) => [v]),
    };
  }

  // Generate all pairs that need to be covered
  const allPairs = generateAllPairs(parameters);
  const uncoveredPairs = new Set(allPairs);
  const rows: string[][] = [];
  const seenRows = new Set<string>(); // Track seen rows to prevent duplicates

  // Greedy algorithm: generate rows until all pairs are covered
  const maxIterations = allPairs.size * 2; // Dynamic limit based on problem size
  let iterations = 0;

  while (uncoveredPairs.size > 0 && iterations < maxIterations) {
    iterations++;

    // Generate the best candidate row
    const candidate = generateBestCandidate(parameters, uncoveredPairs);

    // Check for duplicate rows
    const rowKey = candidate.join('|');
    if (seenRows.has(rowKey)) {
      // Skip duplicate row
      continue;
    }

    // Add this row to results
    rows.push(candidate);
    seenRows.add(rowKey);

    // Mark pairs as covered
    const coveredByThisRow = getPairsCoveredByRow(candidate);
    for (const pair of coveredByThisRow) {
      uncoveredPairs.delete(pair);
    }

    // Safety check: if we're not making progress, break
    if (iterations > 10 && rows.length > allPairs.size) {
      console.warn('Pairwise generation: excessive iterations detected');
      break;
    }
  }

  if (uncoveredPairs.size > 0) {
    console.warn(`Pairwise generation incomplete: ${uncoveredPairs.size} pairs uncovered`);
  }

  return {
    headers: labels,
    rows,
  };
}

/**
 * Calculate coverage statistics for a pairwise result
 * Useful for testing and validation
 */
export function calculateCoverage(input: PairwiseInput, result: PairwiseResult): {
  totalPairs: number;
  coveredPairs: number;
  coveragePercentage: number;
  uncoveredPairs: string[];
} {
  const allPairs = generateAllPairs(input.parameters);
  const coveredPairs = new Set<string>();

  for (const row of result.rows) {
    const pairs = getPairsCoveredByRow(row);
    for (const pair of pairs) {
      coveredPairs.add(pair);
    }
  }

  const uncovered = Array.from(allPairs).filter((p) => !coveredPairs.has(p));

  return {
    totalPairs: allPairs.size,
    coveredPairs: coveredPairs.size,
    coveragePercentage: (coveredPairs.size / allPairs.size) * 100,
    uncoveredPairs: uncovered,
  };
}
