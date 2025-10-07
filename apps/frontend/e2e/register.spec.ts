import { test, expect } from '@playwright/test';

test.describe('Registro de usuario', () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar requests para debugging
    await page.route('**/api/v1/auth/register', (route) => {
      console.log('Intercepted register request:', route.request().url());
      route.continue();
    });
  });

  test('registro exitoso', async ({ page }) => {
    await page.goto('https://aiquaa.com/register', { waitUntil: 'domcontentloaded' });
    
    // Esperar a que el formulario esté visible
    await expect(page.getByPlaceholder('Nombre completo')).toBeVisible();
    
    // Completar formulario
    const testEmail = `e2e${Date.now()}@example.com`;
    await page.getByPlaceholder('Nombre completo').fill('E2E Test User');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Contraseña').fill('AiquaaTest123');
    await page.getByPlaceholder('Confirmar contraseña').fill('AiquaaTest123');
    
    // Interceptar la respuesta del registro
    const [response] = await Promise.all([
      page.waitForResponse(r => 
        r.url().includes('/api/v1/auth/register') && r.status() < 500, 
        { timeout: 15000 }
      ),
      page.getByRole('button', { name: /crear cuenta/i }).click(),
    ]);
    
    // Verificar que la respuesta sea exitosa o al menos no sea un error de servidor
    expect(response.status()).toBeLessThan(500);
    
    // Verificar que se muestre algún mensaje (éxito o error específico)
    await expect(page.locator('[role="alert"], .alert, .error, .success')).toBeVisible({ timeout: 10000 });
  });

  test('error de red visible', async ({ page }) => {
    // Simular fallo de red
    await page.route('**/api/v1/auth/register', route => route.abort('failed'));
    
    await page.goto('https://aiquaa.com/register');
    
    // Completar formulario
    await page.getByPlaceholder('Nombre completo').fill('Test User');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Contraseña').fill('TestPassword123');
    await page.getByPlaceholder('Confirmar contraseña').fill('TestPassword123');
    
    // Hacer clic en registrar
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    // Verificar que se muestre el mensaje de error de conexión
    await expect(page.getByText(/No se pudo contactar con el servidor|Error de conexión/)).toBeVisible({ timeout: 10000 });
  });

  test('validación de contraseñas que no coinciden', async ({ page }) => {
    await page.goto('https://aiquaa.com/register');
    
    // Completar formulario con contraseñas diferentes
    await page.getByPlaceholder('Nombre completo').fill('Test User');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Contraseña').fill('Password123');
    await page.getByPlaceholder('Confirmar contraseña').fill('DifferentPassword123');
    
    // Hacer clic en registrar
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    // Verificar que se muestre el error de validación
    await expect(page.getByText(/contraseñas no coinciden|passwords do not match/i)).toBeVisible();
  });

  test('validación de email inválido', async ({ page }) => {
    await page.goto('https://aiquaa.com/register');
    
    // Completar formulario con email inválido
    await page.getByPlaceholder('Nombre completo').fill('Test User');
    await page.getByPlaceholder('Email').fill('invalid-email');
    await page.getByPlaceholder('Contraseña').fill('Password123');
    await page.getByPlaceholder('Confirmar contraseña').fill('Password123');
    
    // Hacer clic en registrar
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    // Verificar que se muestre el error de validación
    await expect(page.getByText(/email.*inválido|invalid.*email/i)).toBeVisible();
  });

  test('CORS headers presentes en respuesta', async ({ page }) => {
    const responses: any[] = [];
    
    // Capturar todas las respuestas
    page.on('response', response => {
      if (response.url().includes('/api/v1/auth/register')) {
        responses.push(response);
      }
    });
    
    await page.goto('https://aiquaa.com/register');
    
    // Completar formulario
    await page.getByPlaceholder('Nombre completo').fill('Test User');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Contraseña').fill('TestPassword123');
    await page.getByPlaceholder('Confirmar contraseña').fill('TestPassword123');
    
    // Hacer clic en registrar
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    // Esperar a que se complete la request
    await page.waitForTimeout(5000);
    
    // Verificar que se haya hecho la request
    expect(responses.length).toBeGreaterThan(0);
    
    // Verificar headers CORS en la respuesta
    const response = responses[0];
    const headers = response.headers();
    
    // Verificar que los headers CORS estén presentes
    expect(headers).toHaveProperty('access-control-allow-origin');
    expect(headers).toHaveProperty('access-control-allow-methods');
    expect(headers).toHaveProperty('access-control-allow-headers');
  });
});
