import type { User } from '@supabase/supabase-js';

type UserMetadata = Record<string, unknown>;

function sanitizeCandidateId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function getString(metadata: UserMetadata | undefined, ...keys: string[]): string {
  if (!metadata) return '';

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function buildGithubProfile(metadata: UserMetadata | undefined): string {
  const directUrl = getString(metadata, 'github_profile', 'githubProfile', 'github_url', 'githubUrl');
  if (directUrl) return directUrl;

  const username = getString(metadata, 'user_name', 'userName', 'preferred_username', 'github_username');
  return username ? `https://github.com/${username}` : '';
}

export function getExamUserDefaults(user: User | null) {
  const metadata = (user?.user_metadata ?? {}) as UserMetadata;
  const fullName =
    getString(metadata, 'full_name', 'name', 'display_name') ||
    user?.email?.split('@')[0] ||
    '';
  const email = user?.email ?? '';
  const githubProfile = buildGithubProfile(metadata);
  const linkedinProfile = getString(
    metadata,
    'linkedin_profile',
    'linkedinProfile',
    'linkedin_url',
    'linkedinUrl',
  );

  const rawCandidateId =
    getString(metadata, 'candidate_id', 'candidateId', 'username', 'user_name') ||
    user?.id ||
    email.split('@')[0] ||
    '';

  return {
    fullName,
    email,
    githubProfile,
    linkedinProfile,
    candidateId: sanitizeCandidateId(rawCandidateId),
  };
}
