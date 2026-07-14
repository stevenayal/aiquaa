// Pure helpers for the Playwright practical lab (`playwright-practico`).
// No Octokit/Supabase here so they can be unit-tested in isolation.
// URL/PR parsing and folder detection are reused from ./gitPractico.

import type { CheckResult } from './gitPractico';

export type { CheckResult };

export const FOLDER_PREFIX = 'prueba_tecnica_playwright_';
export const MIN_SPEC_FILES = 3;
export const POINTS_PER_CHECK = 10;
export const PASSING_SCORE = 70; // at least 7 of 10 checks
export const MAX_PR_FILES = 300; // stop paginating listFiles beyond this
export const MAX_SPEC_FILES_TO_FETCH = 12; // cap getContent requests
export const MAX_SPEC_FILE_BYTES = 200_000; // skip suspiciously large files

const CONFIG_RE = /^playwright\.config\.(ts|js|mts|mjs|cts|cjs)$/i;
const SPEC_RE = /\.(spec|test)\.(ts|js|mts|mjs|tsx|jsx)$/i;

const inFolder = (filename: string, folder: string) =>
  filename.toLowerCase().startsWith(`${folder.toLowerCase()}/`);

/** Path of a playwright.config.* inside the candidate folder, or null. */
export function findPlaywrightConfig(
  filenames: string[],
  folder: string | null
): string | null {
  if (!folder) return null;
  for (const name of filenames) {
    if (!inFolder(name, folder)) continue;
    const base = name.split('/').pop() ?? '';
    if (CONFIG_RE.test(base)) return name;
  }
  return null;
}

/** `*.spec.*` / `*.test.*` files inside the candidate folder. */
export function listSpecFiles(
  filenames: string[],
  folder: string | null
): string[] {
  if (!folder) return [];
  return filenames.filter(
    (name) => inFolder(name, folder) && SPEC_RE.test(name)
  );
}

/** True if the specs use web-first locators (getByRole, getByLabel, ...). */
export function usesWebFirstLocators(contents: string[]): boolean {
  return /getBy(Role|Label|Placeholder|Text|TestId|Title|AltText)\s*\(/.test(
    contents.join('\n')
  );
}

/** True if the specs target the system under test (`/labs/test-app`). */
export function targetsTestApp(contents: string[]): boolean {
  return contents.join('\n').includes('/labs/test-app');
}

export interface ScenarioCoverage {
  login: boolean;
  catalog: boolean;
  cart: boolean;
  checkout: boolean;
}

// Keyword heuristics over the combined spec contents. They are signals, not
// proof of a working test — the 70-point threshold plus the human rubric in
// docs/tools/playwright-practico.md absorb false negatives.
export function detectScenarios(contents: string[]): ScenarioCoverage {
  const all = contents.join('\n').toLowerCase();
  return {
    login: /\/login/.test(all) && /(password|contraseñ)/.test(all),
    catalog: /\/catalog/.test(all) && /(search|buscar|filter|filtr)/.test(all),
    cart:
      /(\/cart|carrito|add.?to.?cart|agregar)/.test(all) && /total/.test(all),
    checkout:
      /\/checkout/.test(all) &&
      /(required|obligatorio|error|valid|inváli)/.test(all),
  };
}

export function scoreChecks(checks: CheckResult[]): {
  score: number;
  maxScore: number;
  passed: boolean;
} {
  const maxScore = checks.length * POINTS_PER_CHECK;
  const score = checks.filter((c) => c.passed).length * POINTS_PER_CHECK;
  return { score, maxScore, passed: score >= PASSING_SCORE };
}
