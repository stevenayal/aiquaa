import { describe, it, expect } from 'vitest';
import { toCsv, fromCsv } from '../src/csv';
import { PairwiseResult } from '../src/types';

describe('toCsv', () => {
  it('should convert result to CSV with counter', () => {
    const result: PairwiseResult = {
      headers: ['Browser', 'OS'],
      rows: [
        ['Chrome', 'Windows'],
        ['Firefox', 'Mac'],
        ['Safari', 'Linux'],
      ],
    };

    const csv = toCsv(result);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('#,Browser,OS');
    expect(lines[1]).toBe('1,Chrome,Windows');
    expect(lines[2]).toBe('2,Firefox,Mac');
    expect(lines[3]).toBe('3,Safari,Linux');
  });

  it('should convert result to CSV without counter', () => {
    const result: PairwiseResult = {
      headers: ['Browser', 'OS'],
      rows: [
        ['Chrome', 'Windows'],
        ['Firefox', 'Mac'],
      ],
    };

    const csv = toCsv(result, { includeCounter: false });
    const lines = csv.split('\n');

    expect(lines[0]).toBe('Browser,OS');
    expect(lines[1]).toBe('Chrome,Windows');
    expect(lines[2]).toBe('Firefox,Mac');
  });

  it('should escape values with commas', () => {
    const result: PairwiseResult = {
      headers: ['Name', 'Description'],
      rows: [['Test, Case', 'A simple test']],
    };

    const csv = toCsv(result, { includeCounter: false });
    const lines = csv.split('\n');

    expect(lines[1]).toBe('"Test, Case",A simple test');
  });

  it('should escape values with quotes', () => {
    const result: PairwiseResult = {
      headers: ['Text'],
      rows: [['He said "hello"']],
    };

    const csv = toCsv(result, { includeCounter: false });
    const lines = csv.split('\n');

    expect(lines[1]).toBe('"He said ""hello"""');
  });

  it('should use custom delimiter', () => {
    const result: PairwiseResult = {
      headers: ['A', 'B'],
      rows: [['1', '2']],
    };

    const csv = toCsv(result, { includeCounter: false, delimiter: ';' });
    const lines = csv.split('\n');

    expect(lines[0]).toBe('A;B');
    expect(lines[1]).toBe('1;2');
  });

  it('should use custom counter label', () => {
    const result: PairwiseResult = {
      headers: ['A', 'B'],
      rows: [['1', '2']],
    };

    const csv = toCsv(result, { counterLabel: 'ID' });
    const lines = csv.split('\n');

    expect(lines[0]).toBe('ID,A,B');
  });
});

describe('fromCsv', () => {
  it('should parse simple CSV', () => {
    const csv = `Browser,OS
Chrome,Windows
Firefox,Mac
Safari,Linux`;

    const result = fromCsv(csv);

    expect(result.labels).toEqual(['Browser', 'OS']);
    expect(result.parameters).toEqual([
      ['Chrome', 'Firefox', 'Safari'],
      ['Windows', 'Mac', 'Linux'],
    ]);
  });

  it('should parse CSV with counter column', () => {
    const csv = `#,Browser,OS
1,Chrome,Windows
2,Firefox,Mac
3,Safari,Linux`;

    const result = fromCsv(csv, { hasCounter: true });

    expect(result.labels).toEqual(['Browser', 'OS']);
    expect(result.parameters).toEqual([
      ['Chrome', 'Firefox', 'Safari'],
      ['Windows', 'Mac', 'Linux'],
    ]);
  });

  it('should handle duplicate values by deduplicating', () => {
    const csv = `Color,Size
Red,Small
Blue,Medium
Red,Large`;

    const result = fromCsv(csv);

    expect(result.parameters[0]).toEqual(['Red', 'Blue']);
    expect(result.parameters[1]).toEqual(['Small', 'Medium', 'Large']);
  });

  it('should parse quoted values', () => {
    const csv = `Name,Description
"Test, Case","A simple test"
Normal,Plain`;

    const result = fromCsv(csv);

    expect(result.parameters[0]).toEqual(['Test, Case', 'Normal']);
    expect(result.parameters[1]).toEqual(['A simple test', 'Plain']);
  });

  it('should handle escaped quotes', () => {
    const csv = `Text
"He said ""hello"""
Plain`;

    const result = fromCsv(csv);

    expect(result.parameters[0]).toEqual(['He said "hello"', 'Plain']);
  });

  it('should throw error for empty CSV', () => {
    expect(() => fromCsv('')).toThrow('empty');
  });

  it('should handle custom delimiter', () => {
    const csv = `A;B
1;2
3;4`;

    const result = fromCsv(csv, { delimiter: ';' });

    expect(result.labels).toEqual(['A', 'B']);
    expect(result.parameters).toEqual([
      ['1', '3'],
      ['2', '4'],
    ]);
  });

  it('should ignore empty lines', () => {
    const csv = `A,B

1,2

3,4
`;

    const result = fromCsv(csv);

    expect(result.parameters[0]).toEqual(['1', '3']);
    expect(result.parameters[1]).toEqual(['2', '4']);
  });
});
