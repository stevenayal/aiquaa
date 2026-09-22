import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const EVENT_PATH = '/eventos/py-testing-fest-2026';
const REGISTRATION_URL = 'https://forms.gle/sEHRrBRMZX8x86V98';

test.describe('PY Testing Fest 2026', () => {
  test('muestra el evento con fecha, sede y programa', async ({ page }) => {
    await page.goto(EVENT_PATH, { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { level: 1, name: 'PY Testing Fest 2026' })
    ).toBeVisible();
    await expect(
      page.getByText('Sábado 26 de septiembre de 2026').first()
    ).toBeVisible();
    await expect(
      page.getByText('Hotel Sheraton, Asunción').first()
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /dolor oculto/i }).first()
    ).toBeVisible();
  });

  test('el CTA abre el formulario de inscripción en otra pestaña', async ({
    page,
  }) => {
    await page.goto(EVENT_PATH, { waitUntil: 'domcontentloaded' });

    const cta = page.getByRole('link', { name: /Inscribirme gratis/i });
    await expect(cta).toHaveAttribute('href', REGISTRATION_URL);
    await expect(cta).toHaveAttribute('target', '_blank');
    await expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('no tiene violaciones críticas de accesibilidad', async ({ page }) => {
    await page.goto(EVENT_PATH, { waitUntil: 'domcontentloaded' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const criticalViolations = results.violations.filter(
      (violation) => violation.impact === 'critical'
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test('el slide de la home lleva al evento', async ({ page }) => {
    // En dev la ruta se compila on demand al navegar: damos margen extra.
    test.slow();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const slideLink = page.locator(`a[href="${EVENT_PATH}"]`).first();
    await expect(slideLink).toHaveCount(1);
    await slideLink.click();

    await page.waitForURL(`**${EVENT_PATH}`, { timeout: 30000 });
    await expect(
      page.getByRole('heading', { level: 1, name: 'PY Testing Fest 2026' })
    ).toBeVisible();
  });
});
