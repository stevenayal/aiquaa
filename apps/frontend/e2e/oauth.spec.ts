import { test, expect } from '@playwright/test';

test.describe('OAuth Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página de login antes de cada test
    await page.goto('/login');
  });

  test('Google OAuth button should redirect to Google OAuth page', async ({ page }) => {
    // Hacer clic en el botón de Google
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    await expect(googleButton).toBeVisible();
    
    // Interceptar la navegación
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      googleButton.click()
    ]);
    
    // Verificar que se abrió una nueva página
    await newPage.waitForLoadState();
    
    // Verificar que la URL contiene el dominio de Google
    const url = newPage.url();
    expect(url).toContain('accounts.google.com');
    expect(url).toContain('oauth2');
    
    // Cerrar la página de OAuth
    await newPage.close();
  });

  test('GitHub OAuth button should redirect to GitHub OAuth page', async ({ page }) => {
    // Hacer clic en el botón de GitHub
    const githubButton = page.locator('button').filter({ hasText: 'GitHub' });
    await expect(githubButton).toBeVisible();
    
    // Interceptar la navegación
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      githubButton.click()
    ]);
    
    // Verificar que se abrió una nueva página
    await newPage.waitForLoadState();
    
    // Verificar que la URL contiene el dominio de GitHub
    const url = newPage.url();
    expect(url).toContain('github.com');
    expect(url).toContain('oauth');
    
    // Cerrar la página de OAuth
    await newPage.close();
  });

  test('OAuth buttons should be disabled during loading', async ({ page }) => {
    // Los botones deberían estar habilitados inicialmente
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    const githubButton = page.locator('button').filter({ hasText: 'GitHub' });
    
    await expect(googleButton).toBeEnabled();
    await expect(githubButton).toBeEnabled();
    
    // Hacer clic en Google para iniciar el proceso
    await googleButton.click();
    
    // Verificar que los botones se deshabilitan durante el proceso
    // (Esto puede requerir ajustes en el componente para ser más visible)
    await expect(googleButton).toBeDisabled();
    await expect(githubButton).toBeDisabled();
  });

  test('OAuth buttons should show proper error handling', async ({ page }) => {
    // Simular un error de OAuth interceptando la respuesta
    await page.route('**/api/auth/signin/google', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'OAuth error' })
      });
    });
    
    // Hacer clic en el botón de Google
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    await googleButton.click();
    
    // Verificar que se muestra un mensaje de error
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: 'No se pudo iniciar sesión con Google' });
    await expect(errorAlert).toBeVisible();
  });

  test('OAuth buttons should work on registration page', async ({ page }) => {
    // Ir a la página de registro
    await page.goto('/register');
    
    // Verificar que los botones de OAuth estén presentes
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    const githubButton = page.locator('button').filter({ hasText: 'GitHub' });
    
    await expect(googleButton).toBeVisible();
    await expect(githubButton).toBeVisible();
    
    // Verificar que los botones tengan el texto correcto
    await expect(googleButton).toContainText('Google');
    await expect(githubButton).toContainText('GitHub');
  });

  test('OAuth buttons should have proper accessibility attributes', async ({ page }) => {
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    const githubButton = page.locator('button').filter({ hasText: 'GitHub' });
    
    // Verificar que los botones tengan screen reader text
    await expect(googleButton.locator('[class*="sr-only"]')).toContainText('Iniciar sesión con Google');
    await expect(githubButton.locator('[class*="sr-only"]')).toContainText('Iniciar sesión con GitHub');
    
    // Verificar que los botones tengan el tipo correcto
    await expect(googleButton).toHaveAttribute('type', 'button');
    await expect(githubButton).toHaveAttribute('type', 'button');
  });
});

test.describe('OAuth Error Scenarios', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Simular un error de red
    await page.route('**/api/auth/signin/google', async route => {
      await route.abort('failed');
    });
    
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    await googleButton.click();
    
    // Verificar que se muestra un mensaje de error apropiado
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: 'No se pudo iniciar sesión con Google' });
    await expect(errorAlert).toBeVisible();
  });

  test('should handle OAuth cancellation', async ({ page }) => {
    await page.goto('/login');
    
    // Simular una cancelación de OAuth
    await page.route('**/api/auth/signin/google', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'OAuth cancelled' })
      });
    });
    
    const googleButton = page.locator('button').filter({ hasText: 'Google' });
    await googleButton.click();
    
    // Verificar que se maneja la cancelación correctamente
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: 'No se pudo iniciar sesión con Google' });
    await expect(errorAlert).toBeVisible();
  });
});
