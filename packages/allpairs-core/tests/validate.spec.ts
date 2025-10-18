import { describe, it, expect } from 'vitest';
import { validatePairwiseInput, assertValidInput } from '../src/validate';
import { PairwiseInput } from '../src/types';

describe('validatePairwiseInput', () => {
  it('should return no errors for valid input', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B', 'C'],
      parameters: [
        ['1', '2'],
        ['X', 'Y', 'Z'],
        ['Red', 'Blue'],
      ],
    };

    const errors = validatePairwiseInput(input);
    expect(errors).toHaveLength(0);
  });

  it('should detect missing labels', () => {
    const input: any = {
      parameters: [['1', '2']],
    };

    const errors = validatePairwiseInput(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.field === 'labels')).toBe(true);
  });

  it('should detect missing parameters', () => {
    const input: any = {
      labels: ['A'],
    };

    const errors = validatePairwiseInput(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.field === 'parameters')).toBe(true);
  });

  it('should detect length mismatch', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [['1', '2']],
    };

    const errors = validatePairwiseInput(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.field === 'length')).toBe(true);
  });

  it('should detect empty labels', () => {
    const input: PairwiseInput = {
      labels: [],
      parameters: [],
    };

    const errors = validatePairwiseInput(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.field === 'labels')).toBe(true);
  });

  it('should detect empty parameter values', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [['1', '2'], []],
    };

    const errors = validatePairwiseInput(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.field.includes('parameters[1]'))).toBe(true);
  });

  it('should detect duplicate parameter values', () => {
    const input: PairwiseInput = {
      labels: ['A'],
      parameters: [['1', '2', '1']],
    };

    const errors = validatePairwiseInput(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes('duplicate'))).toBe(true);
  });

  it('should detect empty string values', () => {
    const input: PairwiseInput = {
      labels: ['A'],
      parameters: [['1', '', '2']],
    };

    const errors = validatePairwiseInput(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes('empty string'))).toBe(true);
  });

  it('should detect duplicate labels', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B', 'A'],
      parameters: [['1'], ['2'], ['3']],
    };

    const errors = validatePairwiseInput(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes('duplicate'))).toBe(true);
  });

  it('should detect non-array parameters', () => {
    const input: any = {
      labels: ['A', 'B'],
      parameters: [['1', '2'], 'not-an-array'],
    };

    const errors = validatePairwiseInput(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.field === 'parameters[1]')).toBe(true);
  });
});

describe('assertValidInput', () => {
  it('should not throw for valid input', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [
        ['1', '2'],
        ['X', 'Y'],
      ],
    };

    expect(() => assertValidInput(input)).not.toThrow();
  });

  it('should throw for invalid input', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [['1', '2']],
    };

    expect(() => assertValidInput(input)).toThrow('Validation failed');
  });

  it('should include error details in exception message', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [['1', '2']],
    };

    try {
      assertValidInput(input);
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.message).toContain('length');
      expect(error.message).toContain('must match');
    }
  });
});
