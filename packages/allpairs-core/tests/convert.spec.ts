import { describe, it, expect } from 'vitest';
import { parseJsonOrYaml, toJson, toYaml, toObjectFormat } from '../src/convert';
import { PairwiseInput } from '../src/types';

describe('parseJsonOrYaml', () => {
  it('should parse JSON in direct format', () => {
    const json = `{
      "labels": ["Browser", "OS"],
      "parameters": [["Chrome", "Firefox"], ["Windows", "Mac"]]
    }`;

    const result = parseJsonOrYaml(json);

    expect(result.labels).toEqual(['Browser', 'OS']);
    expect(result.parameters).toEqual([
      ['Chrome', 'Firefox'],
      ['Windows', 'Mac'],
    ]);
  });

  it('should parse JSON in object format', () => {
    const json = `{
      "Browser": ["Chrome", "Firefox"],
      "OS": ["Windows", "Mac"]
    }`;

    const result = parseJsonOrYaml(json);

    expect(result.labels).toEqual(['Browser', 'OS']);
    expect(result.parameters).toEqual([
      ['Chrome', 'Firefox'],
      ['Windows', 'Mac'],
    ]);
  });

  it('should parse YAML in direct format', () => {
    const yaml = `
labels:
  - Browser
  - OS
parameters:
  - [Chrome, Firefox]
  - [Windows, Mac]
`;

    const result = parseJsonOrYaml(yaml);

    expect(result.labels).toEqual(['Browser', 'OS']);
    expect(result.parameters).toEqual([
      ['Chrome', 'Firefox'],
      ['Windows', 'Mac'],
    ]);
  });

  it('should parse YAML in object format', () => {
    const yaml = `
Browser:
  - Chrome
  - Firefox
OS:
  - Windows
  - Mac
`;

    const result = parseJsonOrYaml(yaml);

    expect(result.labels).toEqual(['Browser', 'OS']);
    expect(result.parameters).toEqual([
      ['Chrome', 'Firefox'],
      ['Windows', 'Mac'],
    ]);
  });

  it('should throw error for invalid JSON/YAML', () => {
    const invalid = 'not valid json or yaml {{{';

    expect(() => parseJsonOrYaml(invalid)).toThrow(); // Will throw either parse error or "must be an object"
  });

  it('should throw error for non-object data', () => {
    const json = '["array", "not", "object"]';

    expect(() => parseJsonOrYaml(json)).toThrow('must be an object');
  });

  it('should throw error for non-array parameter values in object format', () => {
    const json = `{
      "Browser": "not-an-array",
      "OS": ["Windows"]
    }`;

    expect(() => parseJsonOrYaml(json)).toThrow('must be an array');
  });
});

describe('toJson', () => {
  it('should convert to pretty JSON by default', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [
        ['1', '2'],
        ['X', 'Y'],
      ],
    };

    const json = toJson(input);

    expect(json).toContain('  '); // Has indentation
    expect(JSON.parse(json)).toEqual(input);
  });

  it('should convert to compact JSON when pretty=false', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [
        ['1', '2'],
        ['X', 'Y'],
      ],
    };

    const json = toJson(input, false);

    expect(json).not.toContain('  '); // No indentation
    expect(JSON.parse(json)).toEqual(input);
  });
});

describe('toYaml', () => {
  it('should convert to YAML', () => {
    const input: PairwiseInput = {
      labels: ['A', 'B'],
      parameters: [
        ['1', '2'],
        ['X', 'Y'],
      ],
    };

    const yaml = toYaml(input);

    expect(yaml).toContain('labels:');
    expect(yaml).toContain('parameters:');
    expect(yaml).toContain('- A');
    expect(yaml).toContain('- B');
  });
});

describe('toObjectFormat', () => {
  it('should convert to object format', () => {
    const input: PairwiseInput = {
      labels: ['Browser', 'OS'],
      parameters: [
        ['Chrome', 'Firefox'],
        ['Windows', 'Mac'],
      ],
    };

    const obj = toObjectFormat(input);

    expect(obj).toEqual({
      Browser: ['Chrome', 'Firefox'],
      OS: ['Windows', 'Mac'],
    });
  });

  it('should handle single parameter', () => {
    const input: PairwiseInput = {
      labels: ['Color'],
      parameters: [['Red', 'Blue']],
    };

    const obj = toObjectFormat(input);

    expect(obj).toEqual({
      Color: ['Red', 'Blue'],
    });
  });
});
