// Pure helpers for the GitHub practical lab (`git-practico`).
// No Octokit/Supabase here so they can be unit-tested in isolation.

export const FOLDER_PREFIX = 'prueba_tecnica_';
export const POINTS_PER_CHECK = 20;
export const PASSING_SCORE = 80; // at least 4 of 5 checks

export interface RepoSlug {
  owner: string;
  repo: string;
}

/** Parse `https://github.com/owner/repo` (trailing slash / .git tolerated). */
export function parseRepoSlug(repositoryUrl: string): RepoSlug | null {
  const m = repositoryUrl
    .trim()
    .match(/^https:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

/** Extract the trailing number from an issue or pull-request URL. */
export function parseIssueOrPrNumber(url: string): number | null {
  const m = url.trim().match(/\/(?:issues|pull)\/(\d+)(?:[/?#].*)?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** True if a PR body closes the given issue via closes/fixes/resolves #N. */
export function linksIssue(
  prBody: string | null | undefined,
  issueNumber: number
): boolean {
  if (!prBody) return false;
  const re = new RegExp(
    `\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\b[:\\s]+#${issueNumber}\\b`,
    'i'
  );
  return re.test(prBody);
}

/** True if any changed file lives under the prueba_tecnica_* folder. */
export function hasFolderUpload(
  filenames: string[],
  prefix = FOLDER_PREFIX
): { ok: boolean; folder: string | null } {
  for (const name of filenames) {
    const top = name.split('/')[0];
    if (
      top.toLowerCase().startsWith(prefix.toLowerCase()) &&
      name.includes('/')
    ) {
      return { ok: true, folder: top };
    }
  }
  return { ok: false, folder: null };
}

export interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
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
