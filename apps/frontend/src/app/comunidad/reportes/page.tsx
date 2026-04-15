import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Reportadores de Issues | AIQUAA',
  description: 'Lista de personas que contribuyeron reportando issues en el repositorio de AIQUAA.',
};

export const revalidate = 3600; // Revalidar cada hora

interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  labels: { name: string; color: string }[];
  user: GitHubUser;
  pull_request?: unknown; // presente si es PR, no issue
}

interface Reporter {
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
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
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
    // Excluir pull requests (la API los mezcla con issues)
    all.push(...data.filter((i) => !i.pull_request));
    if (data.length < 100) break;
    page++;
  }

  return all;
}

function buildReporters(issues: GitHubIssue[]): Reporter[] {
  const map = new Map<string, Reporter>();

  for (const issue of issues) {
    const { login, avatar_url, html_url } = issue.user;
    if (!map.has(login)) {
      map.set(login, {
        login,
        avatar_url,
        html_url,
        total: 0,
        open: 0,
        closed: 0,
        latest: issue.created_at,
        issues: [],
      });
    }
    const r = map.get(login)!;
    r.total++;
    if (issue.state === 'open') r.open++; else r.closed++;
    if (issue.created_at > r.latest) r.latest = issue.created_at;
    r.issues.push({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      url: issue.html_url,
      created_at: issue.created_at,
    });
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default async function ReportesPage() {
  const issues = await fetchAllIssues();
  const reporters = buildReporters(issues);
  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => i.state === 'open').length;
  const closedIssues = issues.filter((i) => i.state === 'closed').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🐛</div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Reportadores de Issues
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Personas que contribuyeron reportando bugs y mejoras en AIQUAA
          </p>
          <Link
            href="/comunidad"
            className="inline-block text-xs text-indigo-500 hover:underline mt-1"
          >
            ← Volver a Comunidad
          </Link>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total issues', value: totalIssues, color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Abiertos', value: openIssues, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Cerrados', value: closedIssues, color: 'text-emerald-600 dark:text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm"
            >
              <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {reporters.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <p className="text-5xl mb-3">📭</p>
            <p className="font-semibold text-gray-800 dark:text-white">Sin issues reportados aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reporters.map((r, idx) => (
              <div
                key={r.login}
                className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden"
              >
                {/* Fila principal */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Posición */}
                  <span className="w-8 text-center text-lg font-bold text-gray-400 dark:text-slate-500 shrink-0">
                    {idx < 3 ? MEDAL[idx] : `${idx + 1}`}
                  </span>

                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white/20">
                    <Image
                      src={r.avatar_url}
                      alt={r.login}
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      @{r.login}
                    </a>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                      Último: {formatDate(r.latest)}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                      {r.total} {r.total === 1 ? 'issue' : 'issues'}
                    </span>
                    {r.open > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                        {r.open} abierto{r.open !== 1 ? 's' : ''}
                      </span>
                    )}
                    {r.closed > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        {r.closed} resuelto{r.closed !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Lista de issues (colapsada, máx 3 visibles) */}
                <div className="border-t border-gray-100 dark:border-slate-700 px-5 py-3 space-y-1.5">
                  {r.issues
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3)
                    .map((issue) => (
                      <a
                        key={issue.number}
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 group"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            issue.state === 'open'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">
                          #{issue.number}
                        </span>
                        <span className="text-xs text-gray-700 dark:text-slate-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {issue.title}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-600 shrink-0 ml-auto">
                          {formatDate(issue.created_at)}
                        </span>
                      </a>
                    ))}
                  {r.issues.length > 3 && (
                    <a
                      href={`https://github.com/${process.env.GITHUB_REPO || 'stevenayal/aiquaa'}/issues?q=author%3A${r.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:underline"
                    >
                      + {r.issues.length - 3} más →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 dark:text-slate-600">
          Datos del repositorio{' '}
          <a
            href={`https://github.com/${process.env.GITHUB_REPO || 'stevenayal/aiquaa'}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            stevenayal/aiquaa
          </a>{' '}
          · Actualizado cada hora
        </p>
      </div>
    </div>
  );
}
