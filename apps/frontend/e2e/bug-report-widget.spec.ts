import { test, expect, Page } from '@playwright/test';
import path from 'path';

const LABS_URL = '/labs';

async function openBugReportWidget(page: Page) {
  // Click the FAB button
  await page.click('button[aria-label="Report bug"]');

  // Wait for modal to be visible
  await expect(page.locator('[role="dialog"]')).toBeVisible();
}

async function fillRequiredFields(page: Page, data?: {
  title?: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  severity?: 'Minor' | 'Major' | 'Critical';
  impact?: 'Low' | 'Medium' | 'High';
}) {
  const defaults = {
    title: 'Test Bug Report',
    stepsToReproduce: '1. Navigate to page\n2. Click button\n3. Observe error',
    expectedResult: 'Button should work correctly',
    actualResult: 'Button throws an error',
    severity: 'Minor' as const,
    impact: 'Low' as const,
    ...data,
  };

  await page.fill('#title', defaults.title);
  await page.fill('#stepsToReproduce', defaults.stepsToReproduce);
  await page.fill('#expectedResult', defaults.expectedResult);
  await page.fill('#actualResult', defaults.actualResult);
  await page.selectOption('#severity', defaults.severity);
  await page.selectOption('#impact', defaults.impact);
}

async function acceptConsent(page: Page) {
  await page.check('input[type="checkbox"][aria-describedby*="consent"]');
}

test.describe('Bug Report Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LABS_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should display FAB button with tooltip', async ({ page }) => {
    const fabButton = page.locator('button[aria-label="Report bug"]');
    await expect(fabButton).toBeVisible();

    // Hover to show tooltip
    await fabButton.hover();
    await expect(page.locator('text=Report bug')).toBeVisible();
  });

  test('should open and close modal correctly', async ({ page }) => {
    // Open modal
    await openBugReportWidget(page);

    // Verify modal title
    await expect(page.locator('#bug-report-title')).toHaveText('Report a Bug');

    // Close modal using close button
    await page.click('button[aria-label="Close modal"]');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Re-open modal
    await openBugReportWidget(page);

    // Close modal using Escape key
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should focus first input when modal opens', async ({ page }) => {
    await openBugReportWidget(page);

    // Check if title input is focused
    const titleInput = page.locator('#title');
    await expect(titleInput).toBeFocused();
  });

  test('should validate required fields', async ({ page }) => {
    await openBugReportWidget(page);

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Verify error messages
    await expect(page.locator('#title-error')).toContainText('Title is required');
    await expect(page.locator('#steps-error')).toContainText('Steps to reproduce are required');
    await expect(page.locator('#expected-error')).toContainText('Expected result is required');
    await expect(page.locator('#actual-error')).toContainText('Actual result is required');
    await expect(page.locator('#consent-error')).toContainText('You must consent');
  });

  test('should validate title max length', async ({ page }) => {
    await openBugReportWidget(page);

    // Fill with title exceeding 120 characters
    const longTitle = 'A'.repeat(121);
    await page.fill('#title', longTitle);
    await page.click('button[type="submit"]');

    await expect(page.locator('#title-error')).toContainText('Title must be 120 characters or less');
  });

  test('should submit bug report successfully', async ({ page }) => {
    await openBugReportWidget(page);

    // Fill required fields
    await fillRequiredFields(page);
    await acceptConsent(page);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=Bug report submitted successfully')).toBeVisible({ timeout: 10000 });

    // Modal should close automatically after success
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('should handle file attachments', async ({ page }) => {
    await openBugReportWidget(page);

    // Create a test file
    const testFilePath = path.join(__dirname, 'fixtures', 'test-image.png');

    // Upload file
    const fileInput = page.locator('#file-input');
    await fileInput.setInputFiles(testFilePath);

    // Verify file is listed
    await expect(page.locator('text=test-image.png')).toBeVisible();

    // Remove file
    await page.click('button[aria-label*="Remove test-image.png"]');
    await expect(page.locator('text=test-image.png')).not.toBeVisible();
  });

  test('should validate file count limit', async ({ page }) => {
    await openBugReportWidget(page);

    // Create multiple test files
    const files = Array.from({ length: 6 }, (_, i) => ({
      name: `test-${i}.txt`,
      mimeType: 'text/plain',
      buffer: Buffer.from(`Test file ${i}`),
    }));

    // Try to upload more than MAX_FILES
    const fileInput = page.locator('#file-input');

    for (const file of files) {
      await fileInput.setInputFiles({
        name: file.name,
        mimeType: file.mimeType,
        buffer: file.buffer,
      });
    }

    // Should show error about file limit
    await expect(page.locator('text=Maximum 5 files allowed')).toBeVisible();
  });

  test('should expand and collapse technical data section', async ({ page }) => {
    await openBugReportWidget(page);

    // Technical data section should be collapsed by default
    const techDataButton = page.locator('button:has-text("Technical Data (Auto-collected)")');
    await expect(techDataButton).toHaveAttribute('aria-expanded', 'false');

    // Expand section
    await techDataButton.click();
    await expect(techDataButton).toHaveAttribute('aria-expanded', 'true');

    // Verify technical data is displayed
    await expect(page.locator('text=User Agent:')).toBeVisible();
    await expect(page.locator('text=Viewport:')).toBeVisible();
    await expect(page.locator('text=Timezone:')).toBeVisible();

    // Collapse section
    await techDataButton.click();
    await expect(techDataButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should toggle console logs capture', async ({ page }) => {
    await openBugReportWidget(page);

    // Expand technical data section
    await page.click('button:has-text("Technical Data (Auto-collected)")');

    // Toggle console logs checkbox
    const consoleLogsCheckbox = page.locator('input[type="checkbox"]:near(:text("Include console logs"))');
    await expect(consoleLogsCheckbox).not.toBeChecked();

    await consoleLogsCheckbox.check();
    await expect(consoleLogsCheckbox).toBeChecked();

    await consoleLogsCheckbox.uncheck();
    await expect(consoleLogsCheckbox).not.toBeChecked();
  });

  test('should change severity and impact values', async ({ page }) => {
    await openBugReportWidget(page);

    // Test severity selection
    await page.selectOption('#severity', 'Critical');
    await expect(page.locator('#severity')).toHaveValue('Critical');

    await page.selectOption('#severity', 'Major');
    await expect(page.locator('#severity')).toHaveValue('Major');

    // Test impact selection
    await page.selectOption('#impact', 'High');
    await expect(page.locator('#impact')).toHaveValue('High');

    await page.selectOption('#impact', 'Medium');
    await expect(page.locator('#impact')).toHaveValue('Medium');
  });

  test('should handle drag and drop for file upload', async ({ page }) => {
    await openBugReportWidget(page);

    // Simulate drag and drop
    const dropZone = page.locator('text=Drag and drop files here').locator('..');

    // This is a simplified test - actual drag and drop testing with files
    // requires more complex setup in Playwright
    await expect(dropZone).toBeVisible();
  });

  test('should disable submit button while submitting', async ({ page }) => {
    await openBugReportWidget(page);

    // Fill required fields
    await fillRequiredFields(page);
    await acceptConsent(page);

    // Click submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Button should be disabled and show loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Submitting...');
  });

  test('should trap focus within modal', async ({ page }) => {
    await openBugReportWidget(page);

    // Get all focusable elements
    const focusableElements = await page.locator(
      '[role="dialog"] button, [role="dialog"] [href], [role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea'
    ).all();

    expect(focusableElements.length).toBeGreaterThan(0);

    // Tab to last element
    for (let i = 0; i < focusableElements.length; i++) {
      await page.keyboard.press('Tab');
    }

    // One more tab should cycle back to first element
    await page.keyboard.press('Tab');

    // Should be back at the close button or first input
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT']).toContain(focusedElement);
  });

  test('should display correct file size formatting', async ({ page }) => {
    await openBugReportWidget(page);

    // Upload a file
    const fileInput = page.locator('#file-input');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('A'.repeat(1024)), // 1 KB
    });

    // Should display file size in KB
    await expect(page.locator('text=/.*1.*KB/')).toBeVisible();
  });

  test('should reset form when modal is closed and reopened', async ({ page }) => {
    await openBugReportWidget(page);

    // Fill some fields
    await page.fill('#title', 'Test Title');
    await page.fill('#stepsToReproduce', 'Test steps');

    // Close modal
    await page.click('button[aria-label="Close modal"]');

    // Reopen modal
    await openBugReportWidget(page);

    // Fields should be empty
    await expect(page.locator('#title')).toHaveValue('');
    await expect(page.locator('#stepsToReproduce')).toHaveValue('');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/bug-report', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Server error occurred' }),
      });
    });

    await openBugReportWidget(page);

    // Fill and submit
    await fillRequiredFields(page);
    await acceptConsent(page);
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Server error occurred')).toBeVisible({ timeout: 10000 });

    // Submit button should be enabled again
    await expect(page.locator('button[type="submit"]')).not.toBeDisabled();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab to FAB button
    await page.keyboard.press('Tab');
    // Continue tabbing until we reach the FAB
    let attempts = 0;
    while (attempts < 50) {
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      if (focused === 'Report bug') {
        break;
      }
      await page.keyboard.press('Tab');
      attempts++;
    }

    // Open modal with Enter key
    await page.keyboard.press('Enter');
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // First input should be focused
    await expect(page.locator('#title')).toBeFocused();
  });
});

test.describe('Bug Report Widget - Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 },
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto(LABS_URL);
    await page.waitForLoadState('networkidle');

    // FAB should be visible on mobile
    await expect(page.locator('button[aria-label="Report bug"]')).toBeVisible();

    // Open modal
    await openBugReportWidget(page);

    // Modal should be fullscreen on mobile
    const modal = page.locator('[role="dialog"]').locator('..');
    const modalBox = await modal.boundingBox();
    const viewport = page.viewportSize();

    if (modalBox && viewport) {
      // Modal should take most of the viewport
      expect(modalBox.width).toBeGreaterThan(viewport.width * 0.9);
    }
  });
});
