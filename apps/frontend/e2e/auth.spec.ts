import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('should login with fake JWT token', async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/auth/login');
    
    // Llenar el formulario de login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Mock de la respuesta del servidor
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-jwt-token',
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User'
          }
        })
      });
    });
    
    // Enviar el formulario
    await page.click('[data-testid="login-button"]');
    
    // Verificar que se haya guardado el token
    const token = await page.evaluate(() => {
      return window.localStorage.getItem('auth-token');
    });
    expect(token).toBe('fake-jwt-token');
    
    // Verificar que se haya redirigido a la página principal
    await expect(page).toHaveURL('/');
  });

  test('should access protected page after login', async ({ page }) => {
    // Mock de autenticación
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'fake-jwt-token');
    });
    
    // Navegar a una página protegida
    await page.goto('/forum/create');
    
    // Verificar que se pueda acceder a la página
    await expect(page.locator('[data-testid="create-thread-form"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected page without auth', async ({ page }) => {
    // Navegar a una página protegida sin autenticación
    await page.goto('/forum/create');
    
    // Verificar que se redirija a login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should logout successfully', async ({ page }) => {
    // Mock de autenticación
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'fake-jwt-token');
    });
    
    await page.reload();
    
    // Hacer logout
    await page.click('[data-testid="logout-button"]');
    
    // Verificar que se haya eliminado el token
    const token = await page.evaluate(() => {
      return window.localStorage.getItem('auth-token');
    });
    expect(token).toBeNull();
    
    // Verificar que se haya redirigido a la página principal
    await expect(page).toHaveURL('/');
  });

  test('should handle invalid credentials', async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/auth/login');
    
    // Llenar el formulario con credenciales inválidas
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Mock de respuesta de error
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      });
    });
    
    // Enviar el formulario
    await page.click('[data-testid="login-button"]');
    
    // Verificar que se muestre el mensaje de error
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
