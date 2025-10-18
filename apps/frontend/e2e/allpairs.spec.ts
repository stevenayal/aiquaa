import { test, expect } from '@playwright/test';

test.describe('AllPairs Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labs/allpairs');
  });

  test('should load the page with default values', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('All Pairs Generator');
    await expect(page.locator('text=Browser')).toBeVisible();
    await expect(page.locator('text=OS')).toBeVisible();
  });

  test('should generate pairwise combinations from default values', async ({ page }) => {
    // Click generate button
    await page.click('text=Generate Pairwise Combinations');

    // Wait for results
    await expect(page.locator('text=Generated Test Cases')).toBeVisible({ timeout: 10000 });

    // Check that results table is displayed
    await expect(page.locator('table')).toBeVisible();

    // Verify headers
    await expect(page.locator('th:has-text("Browser")')).toBeVisible();
    await expect(page.locator('th:has-text("OS")')).toBeVisible();

    // Verify there are rows
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should add and remove parameters in editor', async ({ page }) => {
    // Click on Editor tab (should be selected by default)
    await expect(page.locator('text=Parameters Editor')).toBeVisible();

    // Add a new parameter
    await page.click('text=Add Parameter');

    // Should have 3 parameters now
    const paramSections = page.locator('text=Parameter Name').count();
    expect(await paramSections).toBe(3);

    // Remove last parameter
    const removeButtons = page.locator('button:has-text("Remove")');
    const lastRemoveButton = removeButtons.last();
    await lastRemoveButton.click();

    // Should be back to 2
    expect(await page.locator('text=Parameter Name').count()).toBe(2);
  });

  test('should add and remove parameter values', async ({ page }) => {
    // Find first parameter's "Add Value" button
    const addValueButton = page.locator('button:has-text("Add Value")').first();
    await addValueButton.click();

    // Find value inputs for first parameter
    const firstParamSection = page.locator('.border').first();
    const valueInputs = firstParamSection.locator('input[placeholder^="Value"]');
    const valueCount = await valueInputs.count();

    expect(valueCount).toBeGreaterThan(3); // Originally 3, should have 4 now

    // Remove the last value
    const removeValueButtons = firstParamSection.locator('button:has-text("✕")');
    await removeValueButtons.last().click();
  });

  test('should parse JSON in JSON/YAML tab', async ({ page }) => {
    // Switch to JSON/YAML tab
    await page.click('text=JSON/YAML');

    // Clear existing text and input new JSON
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.fill(`{
  "labels": ["Test1", "Test2"],
  "parameters": [["A", "B"], ["X", "Y"]]
}`);

    // Click Parse & Convert
    await page.click('text=Parse & Convert');

    // Should see success (no error)
    await expect(page.locator('text=Failed to convert')).not.toBeVisible();

    // Switch back to Editor and verify
    await page.click('text=Editor');
    await expect(page.locator('input[value="Test1"]')).toBeVisible();
    await expect(page.locator('input[value="Test2"]')).toBeVisible();
  });

  test('should load example dataset', async ({ page }) => {
    // Switch to Examples tab
    await page.click('text=Examples');

    // Click on "Car Colors" example
    await page.click('text=Load Example >> nth=0');

    // Switch back to Editor tab
    await page.click('text=Editor');

    // Verify example data loaded
    await expect(page.locator('input[value="Year"]')).toBeVisible();
    await expect(page.locator('input[value="Color"]')).toBeVisible();
    await expect(page.locator('input[value="Car"]')).toBeVisible();
  });

  test('should export CSV', async ({ page }) => {
    // Generate results first
    await page.click('text=Generate Pairwise Combinations');
    await expect(page.locator('text=Generated Test Cases')).toBeVisible({ timeout: 10000 });

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click Export CSV
    await page.click('text=Export CSV');

    // Wait for download
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toBe('pairwise-tests.csv');
  });

  test('should copy to clipboard', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);

    // Generate results first
    await page.click('text=Generate Pairwise Combinations');
    await expect(page.locator('text=Generated Test Cases')).toBeVisible({ timeout: 10000 });

    // Click Copy to Clipboard
    page.on('dialog', (dialog) => dialog.accept());
    await page.click('text=Copy to Clipboard');

    // Verify alert appeared
    await expect(page.locator('text=Copied to clipboard!')).toBeVisible();
  });

  test('should toggle counter column', async ({ page }) => {
    // Generate results
    await page.click('text=Generate Pairwise Combinations');
    await expect(page.locator('text=Generated Test Cases')).toBeVisible({ timeout: 10000 });

    // Counter should be visible by default
    await expect(page.locator('th:has-text("#")')).toBeVisible();

    // Uncheck "Include counter"
    await page.click('label:has-text("Include counter")');

    // Counter column should be hidden
    await expect(page.locator('th:has-text("#")')).not.toBeVisible();
  });

  test('should handle pagination for large results', async ({ page }) => {
    // Load 10x10 example which generates many rows
    await page.click('text=Examples');
    await page.click('text=Load Example >> nth=2'); // 10x10 example

    // Generate
    await page.click('text=Generate Pairwise Combinations');
    await expect(page.locator('text=Generated Test Cases')).toBeVisible({ timeout: 15000 });

    // Check if pagination exists (only if > 50 rows)
    const rowCount = await page.locator('tbody tr').count();

    if (rowCount >= 50) {
      // Pagination should be visible
      await expect(page.locator('text=Previous')).toBeVisible();
      await expect(page.locator('text=Next')).toBeVisible();

      // Click Next
      await page.click('text=Next');

      // Page should update
      await expect(page.locator('text=Page 2')).toBeVisible();
    }
  });

  test('should show validation error for invalid input', async ({ page }) => {
    // Switch to JSON/YAML tab
    await page.click('text=JSON/YAML');

    // Input invalid JSON
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.fill('{ invalid json }');

    // Click Parse & Convert
    await page.click('text=Parse & Convert');

    // Should show error
    await expect(page.locator('text=Invalid JSON or YAML')).toBeVisible();
  });

  test('should persist input in localStorage', async ({ page, context }) => {
    // Modify a parameter name
    const firstLabelInput = page.locator('input[value="Browser"]');
    await firstLabelInput.clear();
    await firstLabelInput.fill('MyBrowser');

    // Reload page
    await page.reload();

    // Value should persist
    await expect(page.locator('input[value="MyBrowser"]')).toBeVisible();
  });

  test('should view help content', async ({ page }) => {
    // Switch to Help tab
    await page.click('text=Help');

    // Verify help content
    await expect(page.locator('text=What is Pairwise Testing?')).toBeVisible();
    await expect(page.locator('text=Benefits')).toBeVisible();
    await expect(page.locator('text=Limitations')).toBeVisible();
  });
});
