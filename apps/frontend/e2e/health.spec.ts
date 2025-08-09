import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('should display health status', async ({ page }) => {
    // Navegar a la página de health
    await page.goto('/health');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que se muestre el status "ok"
    const healthStatus = await page.locator('text=ok').first();
    await expect(healthStatus).toBeVisible();
    
    // Verificar que la página tenga el título correcto
    await expect(page).toHaveTitle(/health/i);
  });

  test('should return 200 status code', async ({ page }) => {
    const response = await page.goto('/health');
    expect(response?.status()).toBe(200);
  });
});
