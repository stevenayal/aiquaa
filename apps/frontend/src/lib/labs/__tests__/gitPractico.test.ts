import { describe, it, expect } from 'vitest';
import {
  parseRepoSlug,
  parseIssueOrPrNumber,
  linksIssue,
  hasFolderUpload,
  scoreChecks,
  type CheckResult,
} from '../gitPractico';

describe('parseRepoSlug', () => {
  it('parses a standard repo url', () => {
    expect(
      parseRepoSlug('https://github.com/stevenayal/bootcamp_ctl_2026')
    ).toEqual({ owner: 'stevenayal', repo: 'bootcamp_ctl_2026' });
  });

  it('tolerates trailing slash and .git', () => {
    expect(parseRepoSlug('https://github.com/a/b/')).toEqual({
      owner: 'a',
      repo: 'b',
    });
    expect(parseRepoSlug('https://github.com/a/b.git')).toEqual({
      owner: 'a',
      repo: 'b',
    });
  });

  it('rejects non-github or deep paths', () => {
    expect(parseRepoSlug('https://gitlab.com/a/b')).toBeNull();
    expect(parseRepoSlug('https://github.com/a/b/tree/main')).toBeNull();
    expect(parseRepoSlug('not a url')).toBeNull();
  });
});

describe('parseIssueOrPrNumber', () => {
  it('extracts issue number', () => {
    expect(parseIssueOrPrNumber('https://github.com/a/b/issues/42')).toBe(42);
  });

  it('extracts pull number with trailing fragment', () => {
    expect(
      parseIssueOrPrNumber('https://github.com/a/b/pull/7#discussion')
    ).toBe(7);
  });

  it('returns null for invalid links', () => {
    expect(parseIssueOrPrNumber('https://github.com/a/b')).toBeNull();
    expect(
      parseIssueOrPrNumber('https://github.com/a/b/issues/abc')
    ).toBeNull();
  });
});

describe('linksIssue', () => {
  it('detects closes/fixes/resolves variants', () => {
    expect(linksIssue('Closes #42', 42)).toBe(true);
    expect(linksIssue('this fixes #42 nicely', 42)).toBe(true);
    expect(linksIssue('resolved #42', 42)).toBe(true);
  });

  it('is case-insensitive but number-specific', () => {
    expect(linksIssue('CLOSES #42', 42)).toBe(true);
    expect(linksIssue('Closes #43', 42)).toBe(false);
  });

  it('returns false when no keyword or empty body', () => {
    expect(linksIssue('see #42', 42)).toBe(false);
    expect(linksIssue(null, 42)).toBe(false);
    expect(linksIssue('', 42)).toBe(false);
  });
});

describe('hasFolderUpload', () => {
  it('detects a file under prueba_tecnica_* folder', () => {
    const r = hasFolderUpload([
      'prueba_tecnica_steven/apis/x.json',
      'README.md',
    ]);
    expect(r.ok).toBe(true);
    expect(r.folder).toBe('prueba_tecnica_steven');
  });

  it('rejects root-level files only', () => {
    expect(hasFolderUpload(['README.md', 'prueba_tecnica_steven']).ok).toBe(
      false
    );
  });

  it('rejects unrelated folders', () => {
    expect(hasFolderUpload(['docs/x.md']).ok).toBe(false);
  });
});

describe('scoreChecks', () => {
  const mk = (passed: boolean[]): CheckResult[] =>
    passed.map((p, i) => ({ id: `c${i}`, label: `c${i}`, passed: p }));

  it('scores 20 points per passing check', () => {
    expect(scoreChecks(mk([true, true, true, true, true]))).toEqual({
      score: 100,
      maxScore: 100,
      passed: true,
    });
  });

  it('passes at 4 of 5 (80)', () => {
    const r = scoreChecks(mk([true, true, true, true, false]));
    expect(r.score).toBe(80);
    expect(r.passed).toBe(true);
  });

  it('fails below 80', () => {
    const r = scoreChecks(mk([true, true, true, false, false]));
    expect(r.score).toBe(60);
    expect(r.passed).toBe(false);
  });
});
