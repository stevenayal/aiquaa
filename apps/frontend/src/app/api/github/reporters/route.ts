import { NextResponse } from 'next/server';

export const revalidate = 3600;

interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  user: { login: string; avatar_url: string; html_url: string };
  pull_request?: unknown;
}

export interface Reporter {
  login: string;
  avatar_url: string;
  html_url: string;
  total: number;
  open: number;
  closed: number;
  latest: string;
  issues: { number: number; title: string; state: string; url: string; created_at: string }[];
}

async function fetchAllIssues(): Promise<GitHubIssue[]> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'stevenayal/aiquaa';
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const all: GitHubIssue[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=all&per_page=100&page=${page}`,
      { headers, next: { revalidate: 3600 } },
    );
    if (!res.ok) break;
    const data: GitHubIssue[] = await res.json();
    if (!data.length) break;
    all.push(...data.filter((i) => !i.pull_request));
    if (data.length < 100) break;
    page++;
  }

  return all;
}

export async function GET() {
  try {
    const issues = await fetchAllIssues();

    const map = new Map<string, Reporter>();
    for (const issue of issues) {
      const { login, avatar_url, html_url } = issue.user;
      if (!map.has(login)) {
        map.set(login, { login, avatar_url, html_url, total: 0, open: 0, closed: 0, latest: issue.created_at, issues: [] });
      }
      const r = map.get(login)!;
      r.total++;
      if (issue.state === 'open') r.open++; else r.closed++;
      if (issue.created_at > r.latest) r.latest = issue.created_at;
      r.issues.push({ number: issue.number, title: issue.title, state: issue.state, url: issue.html_url, created_at: issue.created_at });
    }

    const reporters = [...map.values()].sort((a, b) => b.total - a.total);
    const totalOpen = issues.filter((i) => i.state === 'open').length;
    const totalClosed = issues.filter((i) => i.state === 'closed').length;

    return NextResponse.json({ reporters, totalIssues: issues.length, totalOpen, totalClosed });
  } catch (err) {
    return NextResponse.json({ error: 'Error al obtener issues' }, { status: 500 });
  }
}
