import { describe, it, expect } from 'vitest';
import {
  findPlaywrightConfig,
  listSpecFiles,
  usesWebFirstLocators,
  targetsTestApp,
  detectScenarios,
  scoreChecks,
  FOLDER_PREFIX,
  type CheckResult,
} from '../playwrightPractico';
import { hasFolderUpload } from '../gitPractico';

const FOLDER = 'prueba_tecnica_playwright_steven';

describe('FOLDER_PREFIX + hasFolderUpload (reused from gitPractico)', () => {
  it('detects the playwright folder with the explicit prefix', () => {
    const r = hasFolderUpload(
      [`${FOLDER}/playwright.config.ts`, 'README.md'],
      FOLDER_PREFIX
    );
    expect(r.ok).toBe(true);
    expect(r.folder).toBe(FOLDER);
  });

  it('rejects the generic prueba_tecnica_* folder of git-practico', () => {
    expect(
      hasFolderUpload(['prueba_tecnica_steven/x.json'], FOLDER_PREFIX).ok
    ).toBe(false);
  });
});

describe('findPlaywrightConfig', () => {
  it('finds a ts config inside the folder', () => {
    expect(
      findPlaywrightConfig(
        [`${FOLDER}/playwright.config.ts`, `${FOLDER}/tests/login.spec.ts`],
        FOLDER
      )
    ).toBe(`${FOLDER}/playwright.config.ts`);
  });

  it('finds a js config in a subfolder', () => {
    expect(
      findPlaywrightConfig([`${FOLDER}/e2e/playwright.config.js`], FOLDER)
    ).toBe(`${FOLDER}/e2e/playwright.config.js`);
  });

  it('ignores configs outside the folder and returns null without folder', () => {
    expect(findPlaywrightConfig(['playwright.config.ts'], FOLDER)).toBeNull();
    expect(findPlaywrightConfig(['playwright.config.ts'], null)).toBeNull();
  });
});

describe('listSpecFiles', () => {
  it('lists spec and test files inside the folder only', () => {
    const files = [
      `${FOLDER}/tests/login.spec.ts`,
      `${FOLDER}/tests/cart.test.js`,
      `${FOLDER}/playwright.config.ts`,
      'e2e/other.spec.ts',
    ];
    expect(listSpecFiles(files, FOLDER)).toEqual([
      `${FOLDER}/tests/login.spec.ts`,
      `${FOLDER}/tests/cart.test.js`,
    ]);
  });

  it('returns empty without folder', () => {
    expect(listSpecFiles(['a.spec.ts'], null)).toEqual([]);
  });
});

describe('usesWebFirstLocators', () => {
  it('detects getByRole / getByLabel', () => {
    expect(
      usesWebFirstLocators(["page.getByRole('button', { name: 'Entrar' })"])
    ).toBe(true);
    expect(usesWebFirstLocators(["page.getByLabel('Email')"])).toBe(true);
  });

  it('rejects css-only locators', () => {
    expect(
      usesWebFirstLocators(["page.locator('#login')", "page.click('.btn')"])
    ).toBe(false);
  });
});

describe('targetsTestApp', () => {
  it('detects the test-app base url', () => {
    expect(
      targetsTestApp(["await page.goto('https://aiquaa.com/labs/test-app');"])
    ).toBe(true);
    expect(targetsTestApp(["await page.goto('https://example.com');"])).toBe(
      false
    );
  });
});

describe('detectScenarios', () => {
  it('detects each scenario from minimal specs', () => {
    const r = detectScenarios([
      "await page.goto('/labs/test-app/login'); await page.fill('input', password);",
      "await page.goto('/labs/test-app/catalog'); await search.fill('mouse');",
      "await addToCart.click(); await expect(page.getByText('Total')).toBeVisible();",
      "await page.goto('/labs/test-app/checkout'); await expect(error).toContainText('obligatorio');",
    ]);
    expect(r).toEqual({
      login: true,
      catalog: true,
      cart: true,
      checkout: true,
    });
  });

  it('requires both signals per scenario', () => {
    const r = detectScenarios(["await page.goto('/labs/test-app/login');"]);
    expect(r.login).toBe(false);
    expect(r.catalog).toBe(false);
    expect(r.cart).toBe(false);
    expect(r.checkout).toBe(false);
  });

  it('is case-insensitive', () => {
    const r = detectScenarios([
      "await page.goto('/labs/test-app/LOGIN'); // PASSWORD check",
    ]);
    expect(r.login).toBe(true);
  });
});

describe('scoreChecks', () => {
  const mk = (passed: boolean[]): CheckResult[] =>
    passed.map((p, i) => ({ id: `c${i}`, label: `c${i}`, passed: p }));

  it('scores 10 points per passing check', () => {
    const r = scoreChecks(mk(Array(10).fill(true)));
    expect(r).toEqual({ score: 100, maxScore: 100, passed: true });
  });

  it('passes at 7 of 10 (70)', () => {
    const r = scoreChecks(mk([...Array(7).fill(true), ...Array(3).fill(false)]));
    expect(r.score).toBe(70);
    expect(r.passed).toBe(true);
  });

  it('fails below 70', () => {
    const r = scoreChecks(mk([...Array(6).fill(true), ...Array(4).fill(false)]));
    expect(r.score).toBe(60);
    expect(r.passed).toBe(false);
  });
});
