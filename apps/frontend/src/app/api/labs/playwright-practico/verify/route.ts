import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { createClient } from '@/lib/supabase/server';
import { validateProcessCodeAction } from '@/actions/employer';
import { saveExamResultAction } from '@/actions/exams';
import {
  parseRepoSlug,
  parseIssueOrPrNumber,
  hasFolderUpload,
} from '@/lib/labs/gitPractico';
import {
  FOLDER_PREFIX,
  MIN_SPEC_FILES,
  MAX_PR_FILES,
  MAX_SPEC_FILES_TO_FETCH,
  MAX_SPEC_FILE_BYTES,
  PASSING_SCORE,
  findPlaywrightConfig,
  listSpecFiles,
  usesWebFirstLocators,
  targetsTestApp,
  detectScenarios,
  scoreChecks,
  type CheckResult,
} from '@/lib/labs/playwrightPractico';

/**
 * Verifica la prueba práctica de Playwright contra el repo del proceso de
 * contratación. La verificación es estática: lista los archivos del PR y lee
 * el contenido de los specs vía GitHub API (no ejecuta los tests); las
 * heurísticas se complementan con revisión manual (review_status pendiente).
 *
 * Env requerida:
 * - GITHUB_TOKEN: token con permiso de lectura sobre el repo destino (evita
 *   rate limits; sin token el límite anónimo de 60 req/h hace inviable el lab).
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
    const prUrl: string = body?.pr_url?.trim() ?? '';

    if (!processCode || !candidateGithub || !prUrl) {
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
    if (!(process.exam_types ?? []).includes('playwright-practico')) {
      return NextResponse.json(
        { error: 'Este proceso no incluye la prueba práctica de Playwright' },
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

    // 3. Parsear link del PR
    const prNumber = parseIssueOrPrNumber(prUrl);
    if (!prNumber) {
      return NextResponse.json(
        { error: 'El link del Pull Request no es válido' },
        { status: 400 }
      );
    }

    // 4. Chequeos con GitHub API
    const octokit = getOctokit();
    const { owner, repo } = slug;

    const pr = await octokit.pulls
      .get({ owner, repo, pull_number: prNumber })
      .then((r) => r.data)
      .catch(() => null);

    // Paginado con tope: un candidato que commitea node_modules/ puede superar
    // por mucho los 100 archivos de la primera página.
    const filenames: string[] = [];
    if (pr) {
      try {
        await octokit.paginate(
          octokit.pulls.listFiles,
          { owner, repo, pull_number: prNumber, per_page: 100 },
          (response, done) => {
            for (const f of response.data) filenames.push(f.filename);
            if (filenames.length >= MAX_PR_FILES) done();
            return response.data;
          }
        );
      } catch {
        /* seguimos con lo que se haya podido listar */
      }
    }

    const folder = hasFolderUpload(filenames, FOLDER_PREFIX);
    const configPath = findPlaywrightConfig(filenames, folder.folder);
    const specFiles = listSpecFiles(filenames, folder.folder);

    // Contenido de los specs en el head del PR. `refs/pull/N/head` existe en el
    // repo base también cuando el PR viene de un fork.
    const contents: string[] = [];
    for (const path of specFiles.slice(0, MAX_SPEC_FILES_TO_FETCH)) {
      const data = await octokit.repos
        .getContent({ owner, repo, path, ref: `refs/pull/${prNumber}/head` })
        .then((r) => r.data)
        .catch(() => null);
      if (
        data &&
        !Array.isArray(data) &&
        data.type === 'file' &&
        typeof data.content === 'string' &&
        data.size <= MAX_SPEC_FILE_BYTES
      ) {
        contents.push(Buffer.from(data.content, 'base64').toString('utf-8'));
      }
    }

    const scenarios = detectScenarios(contents);

    const checks: CheckResult[] = [
      {
        id: 'pr',
        label: 'Pull Request abierto por el candidato',
        passed: Boolean(pr && eqLogin(pr.user?.login, candidateGithub)),
        detail: pr ? undefined : 'No se encontró el PR',
      },
      {
        id: 'folder',
        label: `Carpeta subida (${FOLDER_PREFIX}*)`,
        passed: folder.ok,
        detail:
          folder.folder ??
          (filenames.length >= MAX_PR_FILES
            ? `PR con demasiados archivos (>${MAX_PR_FILES}); ¿subiste node_modules?`
            : undefined),
      },
      {
        id: 'config',
        label: 'playwright.config incluido en la carpeta',
        passed: Boolean(configPath),
        detail: configPath ?? undefined,
      },
      {
        id: 'specs',
        label: `Al menos ${MIN_SPEC_FILES} archivos *.spec/*.test`,
        passed: specFiles.length >= MIN_SPEC_FILES,
        detail: `${specFiles.length} archivo(s) de test`,
      },
      {
        id: 'locators',
        label: 'Locators web-first (getByRole, getByLabel, ...)',
        passed: usesWebFirstLocators(contents),
      },
      {
        id: 'target',
        label: 'Los tests apuntan a /labs/test-app',
        passed: targetsTestApp(contents),
      },
      {
        id: 'esc_login',
        label: 'Escenario: login (válido e inválido)',
        passed: scenarios.login,
      },
      {
        id: 'esc_catalogo',
        label: 'Escenario: búsqueda en catálogo',
        passed: scenarios.catalog,
      },
      {
        id: 'esc_carrito',
        label: 'Escenario: carrito y total',
        passed: scenarios.cart,
      },
      {
        id: 'esc_checkout',
        label: 'Escenario: validación de checkout',
        passed: scenarios.checkout,
      },
    ];

    const { score, maxScore, passed } = scoreChecks(checks);
    const percentage = Math.round((score / maxScore) * 100);
    const correct = checks.filter((c) => c.passed).length;

    // 5. Guardar resultado (aparece en el dashboard del proceso vía process_code)
    await saveExamResultAction({
      exam_type: 'playwright-practico',
      exam_mode: 'exam',
      score,
      total_questions: checks.length,
      max_possible_score: maxScore,
      correct_answers: correct,
      incorrect_answers: checks.length - correct,
      passing_score: PASSING_SCORE,
      passed,
      percentage,
      time_spent: 0,
      github_profile: candidateGithub,
      company_name: process.company_name ?? undefined,
      process_code: process.code,
      metadata: {
        repository: `${owner}/${repo}`,
        pr_url: prUrl,
        folder: folder.folder,
        config_path: configPath,
        spec_files: specFiles,
        checks,
      },
    });

    return NextResponse.json(
      { score, maxScore, percentage, passed, checks },
      { status: 200 }
    );
  } catch (error) {
    console.error('playwright-practico verify error:', error);
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
