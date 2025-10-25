import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  extractMinutes,
  flattenObject,
  convertHeaderCase,
  generateFilename,
} from '../lib/utils';

describe('utils', () => {
  describe('normalizeText', () => {
    it('should trim whitespace', () => {
      expect(normalizeText('  hello  ')).toBe('hello');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeText('hello    world')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(normalizeText('')).toBe('');
    });

    it('should handle mixed whitespace', () => {
      expect(normalizeText('  hello   world  test  ')).toBe('hello world test');
    });
  });

  describe('extractMinutes', () => {
    it('should extract minutes from "min" format', () => {
      expect(extractMinutes('30 min')).toBe('30');
      expect(extractMinutes('15min')).toBe('15');
      expect(extractMinutes('45 minutos')).toBe('45');
    });

    it('should convert hours to minutes', () => {
      expect(extractMinutes('1h')).toBe('60');
      expect(extractMinutes('1 hour')).toBe('60');
      expect(extractMinutes('2 horas')).toBe('120');
      expect(extractMinutes('1.5 hours')).toBe('90');
    });

    it('should extract plain numbers', () => {
      expect(extractMinutes('30')).toBe('30');
      expect(extractMinutes('15.5')).toBe('16');
    });

    it('should return empty string for invalid input', () => {
      expect(extractMinutes('')).toBe('');
      expect(extractMinutes('invalid')).toBe('');
    });
  });

  describe('flattenObject', () => {
    it('should flatten nested objects one level', () => {
      const input = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
        age: 30,
      };

      const result = flattenObject(input);

      expect(result).toEqual({
        'user.name': 'John',
        'user.email': 'john@example.com',
        age: 30,
      });
    });

    it('should handle arrays', () => {
      const input = {
        tags: ['tag1', 'tag2', 'tag3'],
      };

      const result = flattenObject(input);

      expect(result).toEqual({
        tags: 'tag1, tag2, tag3',
      });
    });

    it('should handle mixed types', () => {
      const input = {
        name: 'Test',
        metadata: {
          version: '1.0',
        },
        tags: ['a', 'b'],
      };

      const result = flattenObject(input);

      expect(result).toEqual({
        name: 'Test',
        'metadata.version': '1.0',
        tags: 'a, b',
      });
    });
  });

  describe('convertHeaderCase', () => {
    it('should keep snake_case', () => {
      expect(convertHeaderCase('work_item_key', 'snake_case')).toBe(
        'work_item_key'
      );
    });

    it('should convert to camelCase', () => {
      expect(convertHeaderCase('work_item_key', 'camelCase')).toBe(
        'workItemKey'
      );
      expect(convertHeaderCase('case_id', 'camelCase')).toBe('caseId');
    });

    it('should convert to Title Case', () => {
      expect(convertHeaderCase('work_item_key', 'Title Case')).toBe(
        'Work Item Key'
      );
      expect(convertHeaderCase('case_id', 'Title Case')).toBe('Case Id');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with timestamp', () => {
      const filename = generateFilename('plans', 'KAN-6');
      expect(filename).toMatch(/^plans_KAN-6_\d{12}\.csv$/);
    });

    it('should use default work item key', () => {
      const filename = generateFilename('steps');
      expect(filename).toMatch(/^steps_AIQUAA_\d{12}\.csv$/);
    });

    it('should handle different prefixes', () => {
      const filename = generateFilename('testdata', 'JIRA-123');
      expect(filename).toMatch(/^testdata_JIRA-123_\d{12}\.csv$/);
    });
  });
});
