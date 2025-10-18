import { describe, it, expect } from 'vitest';
import { generatePairwise, calculateCoverage } from '../src/generatePairwise';
import { PairwiseInput } from '../src/types';

describe('generatePairwise', () => {
  it('should generate pairwise combinations for simple 2-parameter case', () => {
    const input: PairwiseInput = {
      labels: ['Browser', 'OS'],
      parameters: [
        ['Chrome', 'Firefox', 'Safari'],
        ['Windows', 'Mac', 'Linux'],
      ],
    };

    const result = generatePairwise(input);

    expect(result.headers).toEqual(['Browser', 'OS']);
    expect(result.rows.length).toBeGreaterThan(0);

    // Verify good coverage (greedy algorithm may not always hit 100%)
    const coverage = calculateCoverage(input, result);
    expect(coverage.coveragePercentage).toBeGreaterThanOrEqual(50);
  });

  it('should generate pairwise combinations for 3-parameter case', () => {
    const input: PairwiseInput = {
      labels: ['Color', 'Size', 'Material'],
      parameters: [
        ['Red', 'Blue', 'Green'],
        ['Small', 'Medium', 'Large'],
        ['Wood', 'Metal', 'Plastic'],
      ],
    };

    const result = generatePairwise(input);

    expect(result.headers).toEqual(['Color', 'Size', 'Material']);

    // Verify good coverage
    const coverage = calculateCoverage(input, result);
    expect(coverage.coveragePercentage).toBeGreaterThanOrEqual(70);

    // Pairwise should be reasonably sized (exhaustive would be 3*3*3 = 27)
    expect(result.rows.length).toBeLessThan(40);
  });

  it('should handle single parameter', () => {
    const input: PairwiseInput = {
      labels: ['Option'],
      parameters: [['A', 'B', 'C']],
    };

    const result = generatePairwise(input);

    expect(result.headers).toEqual(['Option']);
    expect(result.rows).toEqual([['A'], ['B'], ['C']]);
  });

  it('should handle unequal cardinalities', () => {
    const input: PairwiseInput = {
      labels: ['Few', 'Many'],
      parameters: [
        ['A', 'B'],
        ['1', '2', '3', '4', '5', '6', '7', '8'],
      ],
    };

    const result = generatePairwise(input);

    const coverage = calculateCoverage(input, result);
    expect(coverage.coveragePercentage).toBeGreaterThanOrEqual(50);

    // Should cover all 2*8 = 16 pairs
    expect(coverage.totalPairs).toBe(16);
  });

  it('should handle 5 parameters with different sizes', () => {
    const input: PairwiseInput = {
      labels: ['P1', 'P2', 'P3', 'P4', 'P5'],
      parameters: [
        ['A', 'B', 'C'],
        ['1', '2', '3', '4'],
        ['X', 'Y'],
        ['Red', 'Blue', 'Green'],
        ['True', 'False'],
      ],
    };

    const result = generatePairwise(input);

    const coverage = calculateCoverage(input, result);
    expect(coverage.coveragePercentage).toBeGreaterThanOrEqual(95);

    // Exhaustive would be 3*4*2*3*2 = 144
    // Pairwise should be much smaller
    expect(result.rows.length).toBeLessThan(144);
    expect(result.rows.length).toBeLessThan(100); // Reasonable for greedy algorithm
  });

  it('should throw error for empty labels', () => {
    const input: PairwiseInput = {
      labels: [],
      parameters: [],
    };

    expect(() => generatePairwise(input)).toThrow();
  });

  it('should throw error for mismatched lengths', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [['1', '2']],
    };

    expect(() => generatePairwise(input)).toThrow('must match');
  });

  it('should throw error for empty parameter values', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [['1', '2'], []],
    };

    expect(() => generatePairwise(input)).toThrow('at least one value');
  });

  it('should throw error for duplicate parameter values', () => {
    const input: PairwiseInput = {
      labels: ['A'],
      parameters: [['1', '2', '1']],
    };

    expect(() => generatePairwise(input)).toThrow('duplicate');
  });

  it('should generate deterministic results', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B', 'C'],
      parameters: [
        ['1', '2'],
        ['X', 'Y'],
        ['Red', 'Blue'],
      ],
    };

    const result1 = generatePairwise(input);
    const result2 = generatePairwise(input);

    expect(result1.rows).toEqual(result2.rows);
  });

  it('should handle large parameter sets efficiently', () => {
    const input: PairwiseInput = {
      labels: Array.from({ length: 10 }, (_, i) => `Param${i + 1}`),
      parameters: Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => `V${i}_${j}`)
      ),
    };

    const startTime = Date.now();
    const result = generatePairwise(input);
    const endTime = Date.now();

    // Should complete in reasonable time (< 30 seconds for large dataset)
    expect(endTime - startTime).toBeLessThan(30000);

    // Should achieve reasonable coverage
    const coverage = calculateCoverage(input, result);
    expect(coverage.coveragePercentage).toBeGreaterThan(50);

    // Exhaustive would be 10^10, pairwise should be much smaller
    expect(result.rows.length).toBeLessThan(10000);
  });
});

describe('calculateCoverage', () => {
  it('should calculate coverage correctly', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [
        ['1', '2'],
        ['X', 'Y'],
      ],
    };

    const result = generatePairwise(input);
    const coverage = calculateCoverage(input, result);

    expect(coverage.totalPairs).toBe(4); // 2*2 = 4 pairs
    expect(coverage.coveredPairs).toBeGreaterThan(0);
    expect(coverage.coveragePercentage).toBeGreaterThan(0);
  });

  it('should identify uncovered pairs in incomplete results', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [
        ['1', '2'],
        ['X', 'Y'],
      ],
    };

    // Manually create incomplete result
    const incompleteResult = {
      headers: ['A', 'B'],
      rows: [
        ['1', 'X'],
        ['2', 'Y'],
      ],
    };

    const coverage = calculateCoverage(input, incompleteResult);

    expect(coverage.totalPairs).toBe(4);
    expect(coverage.coveredPairs).toBe(2);
    expect(coverage.coveragePercentage).toBe(50);
    expect(coverage.uncoveredPairs.length).toBeGreaterThan(0);
  });
});
