import { test, expect } from '@playwright/test';

test.describe('Registro de usuario', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/register');
  });

  test('debería mostrar el formulario de registro', async ({ page }) => {
    // Verificar que el formulario esté presente
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('debería registrar un usuario exitosamente', async ({ page }) => {
    // Interceptar la llamada al API
    const apiCallPromise = page.waitForRequest(request => 
      request.url().includes('/api/v1/auth/register') && 
      request.method() === 'POST'
    );

    // Llenar el formulario
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    // Enviar el formulario
    await page.click('button[type="submit"]');

    // Esperar la llamada al API
    const request = await apiCallPromise;
    
    // Verificar que la llamada se hizo correctamente
    expect(request.method()).toBe('POST');
    
    const requestBody = request.postDataJSON();
    expect(requestBody).toEqual({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123!'
    });

    // Verificar que se muestra mensaje de éxito
    await expect(page.locator('text=Registro exitoso')).toBeVisible({ timeout: 10000 });
  });

  test('debería mostrar error cuando las contraseñas no coinciden', async ({ page }) => {
    // Llenar el formulario con contraseñas diferentes
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');

    // Enviar el formulario
    await page.click('button[type="submit"]');

    // Verificar que se muestra error de validación
    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible();
  });

  test('debería manejar errores de red/CORS', async ({ page }) => {
    // Interceptar y abortar la llamada al API para simular error de red
    await page.route('**/api/v1/auth/register', route => {
      route.abort('failed');
    });

    // Llenar el formulario
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    // Enviar el formulario
    await page.click('button[type="submit"]');

    // Verificar que se muestra mensaje de error de conexión
    await expect(page.locator('text=No se pudo contactar con el servidor')).toBeVisible({ timeout: 10000 });
  });

  test('debería manejar errores HTTP del servidor', async ({ page }) => {
    // Interceptar y devolver error 409 (email ya registrado)
    await page.route('**/api/v1/auth/register', route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Email already registered'
        })
      });
    });

    // Llenar el formulario
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    // Enviar el formulario
    await page.click('button[type="submit"]');

    // Verificar que se muestra mensaje de error específico
    await expect(page.locator('text=Este email ya está registrado')).toBeVisible({ timeout: 10000 });
  });

  test('debería validar campos requeridos', async ({ page }) => {
    // Enviar formulario vacío
    await page.click('button[type="submit"]');

    // Verificar que se muestran errores de validación
    await expect(page.locator('text=El nombre es requerido')).toBeVisible();
    await expect(page.locator('text=El email es requerido')).toBeVisible();
    await expect(page.locator('text=La contraseña es requerida')).toBeVisible();
  });

  test('debería validar formato de email', async ({ page }) => {
    // Llenar con email inválido
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    // Enviar el formulario
    await page.click('button[type="submit"]');

    // Verificar que se muestra error de validación
    await expect(page.locator('text=El email no es válido')).toBeVisible();
  });

  test('debería validar fortaleza de contraseña', async ({ page }) => {
    // Llenar con contraseña débil
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');

    // Enviar el formulario
    await page.click('button[type="submit"]');

    // Verificar que se muestra error de validación
    await expect(page.locator('text=La contraseña debe tener al menos 8 caracteres')).toBeVisible();
  });
});
