import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],

  // Skip backend-dependent tests in CI — they require a running NestJS backend
  // or real Supabase credentials that aren't available in the runner
  testIgnore: process.env.CI
    ? [
        '**/backend-connectivity.spec.ts',
        '**/forum.crud.spec.ts',
        '**/auth.spec.ts',
        '**/oauth.spec.ts',
        '**/register.spec.ts',
        '**/registration.spec.ts',
        '**/auth/register.spec.ts',
        '**/auth/login.spec.ts',
        '**/bug-report-widget.spec.ts',
      ]
    : [],

  use: {
    baseURL: `http://localhost:${process.env.FRONTEND_PORT || 3001}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: process.env.CI
    ? [
        // Only Chromium in CI — faster, still meaningful signal
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      ]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
        { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
      ],

  webServer: {
    command: 'pnpm dev',
    url: `http://localhost:${process.env.FRONTEND_PORT || 3001}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
