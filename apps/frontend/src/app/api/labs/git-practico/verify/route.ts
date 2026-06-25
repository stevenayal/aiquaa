import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { createClient } from '@/lib/supabase/server';
import { validateProcessCodeAction } from '@/actions/employer';
import { saveExamResultAction } from '@/actions/exams';
import {
  parseRepoSlug,
  parseIssueOrPrNumber,
  linksIssue,
  hasFolderUpload,
  scoreChecks,
  type CheckResult,
} from '@/lib/labs/gitPractico';

/**
 * Verifica una prueba práctica de GitHub contra el repo del proceso de contratación.
 *
 * Env requerida:
 * - GITHUB_TOKEN: token con permiso de lectura sobre el repo destino (evita rate limits;
 *   los repos públicos también se pueden leer sin token pero con límites más bajos).
 */

const getOctokit = () =>
  new Octokit(
    process.env.GITHUB_TOKEN ? { auth: process.env.GITHUB_TOKEN } : {}
  );

const eqLogin = (a?: string | null, b?: string | null) =>
  Boolean(a && b && a.toLowerCase() === b.toLowerCase());

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const processCode: string = body?.process_code?.trim() ?? '';
    const candidateGithub: string = body?.candidate_github?.trim() ?? '';
    const issueUrl: string = body?.issue_url?.trim() ?? '';
    const prUrl: string = body?.pr_url?.trim() ?? '';

    if (!processCode || !candidateGithub || !issueUrl || !prUrl) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // 2. Resolver proceso por código
    const { valid, process, reason } =
      await validateProcessCodeAction(processCode);
    if (!valid || !process) {
      return NextResponse.json(
        {
          error:
            reason === 'expired'
              ? 'El proceso está vencido'
              : 'Código de proceso inválido',
        },
        { status: 403 }
      );
    }
    if (!(process.exam_types ?? []).includes('git-practico')) {
      return NextResponse.json(
        { error: 'Este proceso no incluye la prueba práctica de Git' },
        { status: 403 }
      );
    }

    const slug = process.repository_url
      ? parseRepoSlug(process.repository_url)
      : null;
    if (!slug) {
      return NextResponse.json(
        { error: 'El proceso no tiene un repositorio válido configurado' },
        { status: 422 }
      );
    }

    // 3. Parsear links
    const issueNumber = parseIssueOrPrNumber(issueUrl);
    const prNumber = parseIssueOrPrNumber(prUrl);
    if (!issueNumber || !prNumber) {
      return NextResponse.json(
        { error: 'El link del issue o del PR no es válido' },
        { status: 400 }
      );
    }

    // 4. Chequeos con GitHub API
    const octokit = getOctokit();
    const { owner, repo } = slug;

    const issue = await octokit.issues
      .get({ owner, repo, issue_number: issueNumber })
      .then((r) => r.data)
      .catch(() => null);

    const pr = await octokit.pulls
      .get({ owner, repo, pull_number: prNumber })
      .then((r) => r.data)
      .catch(() => null);

    const prFiles = pr
      ? await octokit.pulls
          .listFiles({ owner, repo, pull_number: prNumber, per_page: 100 })
          .then((r) => r.data.map((f) => f.filename))
          .catch(() => [])
      : [];

    const folder = hasFolderUpload(prFiles);

    const checks: CheckResult[] = [
      {
        id: 'issue',
        label: 'Issue creado por el candidato',
        passed: Boolean(
          issue &&
            !issue.pull_request &&
            eqLogin(issue.user?.login, candidateGithub)
        ),
        detail: issue ? undefined : 'No se encontró el issue',
      },
      {
        id: 'pr',
        label: 'Pull Request abierto por el candidato',
        passed: Boolean(pr && eqLogin(pr.user?.login, candidateGithub)),
        detail: pr ? undefined : 'No se encontró el PR',
      },
      {
        id: 'branch',
        label: 'Rama de trabajo distinta de la base',
        passed: Boolean(pr && pr.head?.ref && pr.head.ref !== pr.base?.ref),
        detail: pr?.head?.ref ? `rama: ${pr.head.ref}` : undefined,
      },
      {
        id: 'folder',
        label: `Carpeta subida (${'prueba_tecnica_*'})`,
        passed: folder.ok,
        detail: folder.folder ?? undefined,
      },
      {
        id: 'link',
        label: 'El PR cierra el issue (Closes #N)',
        passed: linksIssue(pr?.body, issueNumber),
      },
    ];

    const { score, maxScore, passed } = scoreChecks(checks);
    const percentage = Math.round((score / maxScore) * 100);
    const correct = checks.filter((c) => c.passed).length;

    // 5. Guardar resultado (aparece en el dashboard del proceso vía process_code)
    await saveExamResultAction({
      exam_type: 'git-practico',
      exam_mode: 'exam',
      score,
      total_questions: checks.length,
      max_possible_score: maxScore,
      correct_answers: correct,
      incorrect_answers: checks.length - correct,
      passing_score: 80,
      passed,
      percentage,
      time_spent: 0,
      github_profile: candidateGithub,
      company_name: process.company_name ?? undefined,
      process_code: process.code,
      metadata: {
        repository: `${owner}/${repo}`,
        issue_url: issueUrl,
        pr_url: prUrl,
        checks,
      },
    });

    return NextResponse.json(
      { score, maxScore, percentage, passed, checks },
      { status: 200 }
    );
  } catch (error) {
    console.error('git-practico verify error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error inesperado al verificar',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
