import { test, expect } from '@playwright/test';

test.describe('JSON to Test Plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labs/json-to-testplans');
  });

  test('should display the page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('JSON to Test Plans');
    await expect(page.locator('textarea')).toBeVisible();
    await expect(
      page.locator('button:has-text("Cargar demo (KAN-6)")')
    ).toBeVisible();
  });

  test('should load demo JSON successfully', async ({ page }) => {
    await page.click('button:has-text("Cargar demo (KAN-6)")');

    // Wait for success message
    await expect(
      page.locator('text=Demo cargado exitosamente')
    ).toBeVisible();

    // Check that textarea has content
    const textareaContent = await page.locator('textarea').inputValue();
    expect(textareaContent.length).toBeGreaterThan(0);
    expect(textareaContent).toContain('KAN-6');
  });

  test('should validate and process JSON', async ({ page }) => {
    // Load demo
    await page.click('button:has-text("Cargar demo (KAN-6)")');
    await page.waitForTimeout(500);

    // Click load and validate
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Wait for success message
    await expect(
      page.locator('text=/JSON validado exitosamente/')
    ).toBeVisible();

    // Check that processed count is shown
    await expect(page.locator('text=/casos de prueba procesado/')).toBeVisible();
  });

  test('should show preview tabs after processing', async ({ page }) => {
    // Load and process demo
    await page.click('button:has-text("Cargar demo (KAN-6)")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Wait for preview to appear
    await expect(page.locator('h2:has-text("Preview de datos")')).toBeVisible();

    // Check tabs
    await expect(page.locator('button:has-text("Planes")')).toBeVisible();
    await expect(page.locator('button:has-text("Pasos")')).toBeVisible();
    await expect(
      page.locator('button:has-text("Precondiciones")')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Datos de prueba")')
    ).toBeVisible();
  });

  test('should display data in preview table', async ({ page }) => {
    // Load and process demo
    await page.click('button:has-text("Cargar demo (KAN-6)")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Wait for table
    await expect(page.locator('table')).toBeVisible();

    // Check headers
    await expect(page.locator('th:has-text("work_item_key")')).toBeVisible();
    await expect(page.locator('th:has-text("case_id")')).toBeVisible();
    await expect(page.locator('th:has-text("title")')).toBeVisible();

    // Check data
    await expect(page.locator('td:has-text("KAN-6")')).toBeVisible();
    await expect(page.locator('td:has-text("TC-KAN-6-001")')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Load and process demo
    await page.click('button:has-text("Cargar demo (KAN-6)")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Click on Steps tab
    await page.click('button:has-text("Pasos")');
    await expect(page.locator('th:has-text("step_number")')).toBeVisible();

    // Click on Preconditions tab
    await page.click('button:has-text("Precondiciones")');
    await expect(
      page.locator('th:has-text("precondition_number")')
    ).toBeVisible();

    // Click on Test Data tab
    await page.click('button:has-text("Datos de prueba")');
    await expect(page.locator('th:has-text("key")')).toBeVisible();
    await expect(page.locator('th:has-text("value")')).toBeVisible();
  });

  test('should change export options', async ({ page }) => {
    // Load and process demo
    await page.click('button:has-text("Cargar demo (KAN-6)")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Change delimiter
    await page.selectOption('select', { label: 'Punto y coma (;)' });

    // Change header case
    const selects = await page.locator('select').all();
    await selects[1].selectOption({ label: 'camelCase' });

    // Check join steps checkbox
    await page.check('input[type="checkbox"]:below(:has-text("Unir pasos"))');

    // Verify steps tab is disabled
    const stepsTab = page.locator('button:has-text("Pasos")');
    await expect(stepsTab).toBeDisabled();
  });

  test('should handle invalid JSON', async ({ page }) => {
    // Enter invalid JSON
    await page.fill('textarea', '{ invalid json }');

    // Try to validate
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Check for error message
    await expect(page.locator('text=/JSON inválido/')).toBeVisible();
  });

  test('should handle missing required fields', async ({ page }) => {
    // Enter JSON with missing required fields
    const invalidJson = JSON.stringify({
      casos_prueba: [
        {
          // Missing id_caso_prueba and titulo
          descripcion: 'Test',
        },
      ],
    });

    await page.fill('textarea', invalidJson);
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Check for validation error
    await expect(page.locator('text=/Errores de validación/')).toBeVisible();
  });

  test('should clear all data on reset', async ({ page }) => {
    // Load demo
    await page.click('button:has-text("Cargar demo (KAN-6)")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Wait for preview
    await expect(page.locator('h2:has-text("Preview de datos")')).toBeVisible();

    // Click reset
    await page.click('button:has-text("Limpiar todo")');

    // Check that textarea is empty
    const textareaContent = await page.locator('textarea').inputValue();
    expect(textareaContent).toBe('');

    // Check that preview is gone
    await expect(
      page.locator('h2:has-text("Preview de datos")')
    ).not.toBeVisible();
  });

  test('should handle file upload', async ({ page }) => {
    const validJson = {
      id_work_item: 'TEST-1',
      casos_prueba: [
        {
          id_caso_prueba: 'TC001',
          titulo: 'Test case from file',
          pasos: ['Step 1'],
          precondiciones: ['Precondition 1'],
          datos_prueba: { key: 'value' },
        },
      ],
    };

    // Create a file-like object
    const buffer = Buffer.from(JSON.stringify(validJson));
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer,
    });

    // Wait for content to load
    await page.waitForTimeout(500);

    // Verify content was loaded
    const textareaContent = await page.locator('textarea').inputValue();
    expect(textareaContent).toContain('TEST-1');
    expect(textareaContent).toContain('TC001');
  });

  test('should export CSV (download trigger)', async ({ page }) => {
    // Load and process demo
    await page.click('button:has-text("Cargar demo (KAN-6)")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('button:has-text("Exportar plans.csv")');

    // Wait for download
    const download = await downloadPromise;

    // Check filename
    expect(download.suggestedFilename()).toMatch(/^plans_KAN-6_\d{12}\.csv$/);
  });

  test('should copy CSV to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Load and process demo
    await page.click('button:has-text("Cargar demo (KAN-6)")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Click copy to clipboard
    await page.click('button:has-text("Copiar al portapapeles")');

    // Wait for success message
    await expect(
      page.locator('text=/CSV de .* copiado al portapapeles/')
    ).toBeVisible();

    // Verify clipboard content
    const clipboardContent = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardContent).toContain('work_item_key');
    expect(clipboardContent).toContain('KAN-6');
  });

  test('should paginate large result sets', async ({ page }) => {
    // Create a large dataset
    const casos = Array.from({ length: 60 }, (_, i) => ({
      id_caso_prueba: `TC${String(i + 1).padStart(3, '0')}`,
      titulo: `Test case ${i + 1}`,
      pasos: ['Step 1'],
    }));

    const largeJson = JSON.stringify({
      casos_prueba: casos,
    });

    await page.fill('textarea', largeJson);
    await page.click('button:has-text("Cargar y Validar JSON")');

    // Wait for table
    await expect(page.locator('table')).toBeVisible();

    // Check pagination controls
    await expect(page.locator('text=/Mostrando 1 a 50/')).toBeVisible();
    await expect(page.locator('button:has-text("Siguiente")')).toBeVisible();

    // Click next page
    await page.click('button:has-text("Siguiente")');

    // Check that we're on page 2
    await expect(page.locator('text=/Mostrando 51 a 60/')).toBeVisible();
  });

  test('should persist input to localStorage', async ({ page }) => {
    const testJson = JSON.stringify({ test: 'data' });

    // Enter some JSON
    await page.fill('textarea', testJson);

    // Reload page
    await page.reload();

    // Check that JSON is still there
    const textareaContent = await page.locator('textarea').inputValue();
    expect(textareaContent).toBe(testJson);
  });
});
