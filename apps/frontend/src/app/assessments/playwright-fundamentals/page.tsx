import { Metadata } from 'next';
import { playwrightFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Playwright — Fundamentos | AIQUAA',
  description:
    'Prueba técnica teórica sobre Playwright: Test CLI y configuración, locators web-first, assertions con auto-retry, y fixtures/hooks/debugging.',
  keywords: [
    'Playwright',
    'automatización',
    'testing E2E',
    'locators',
    'assertions',
    'fixtures',
    'QA',
    'testing',
    'AIQUAA',
    'evaluación técnica',
  ],
  openGraph: {
    title: 'Playwright — Fundamentos | AIQUAA',
    description:
      'Prueba técnica teórica sobre Playwright: CLI, locators, assertions y fixtures.',
    url: 'https://aiquaa.com/assessments/playwright-fundamentals',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Playwright%20-%20Fundamentos&subtitle=CLI%2C%20Locators%20y%20Assertions&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Playwright Fundamentos - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playwright — Fundamentos | AIQUAA',
    description:
      'Prueba técnica sobre CLI, locators, assertions y fixtures de Playwright.',
    images: [
      '/api/og?title=Playwright%20-%20Fundamentos&subtitle=CLI%2C%20Locators%20y%20Assertions&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/playwright-fundamentals',
  },
};

export default function PlaywrightFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-playwright-fundamentals',
      slug: playwrightFundamentalsDefinition.slug,
      title: playwrightFundamentalsDefinition.title,
      description: playwrightFundamentalsDefinition.description,
      level: playwrightFundamentalsDefinition.level,
      type: playwrightFundamentalsDefinition.type,
      duration_minutes: playwrightFundamentalsDefinition.duration_minutes,
      total_score: playwrightFundamentalsDefinition.total_score,
      is_active: playwrightFundamentalsDefinition.is_active,
      metadata: playwrightFundamentalsDefinition.metadata,
    },
    sections: playwrightFundamentalsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-playwright-fundamentals',
        slug: section.slug,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        max_score: section.max_score,
        metadata: section.metadata,
      })
    ),
  };

  return (
    <AssessmentWelcome
      overview={overview}
      startHref="/assessments/playwright-fundamentals/start"
      evaluatesCopy="Test CLI y playwright.config.ts; locators web-first (getByRole, getByLabel, getByTestId) y auto-waiting; assertions auto-retrying; fixtures built-in/custom, hooks y herramientas de debugging (Inspector, Trace Viewer, UI mode)."
      scoringCopy="Automático en los 4 niveles: selección múltiple, verdadero/falso y respuesta corta sobre snippets reales de código Playwright."
      resultCopy="Score total, score por nivel, fortalezas, debilidades y temas a reforzar."
      referenceLinks={[
        { label: 'Test CLI', href: 'https://playwright.dev/docs/test-cli' },
        { label: 'Locators', href: 'https://playwright.dev/docs/locators' },
        {
          label: 'Assertions',
          href: 'https://playwright.dev/docs/test-assertions',
        },
        {
          label: 'Fixtures',
          href: 'https://playwright.dev/docs/test-fixtures',
        },
      ]}
    />
  );
}
