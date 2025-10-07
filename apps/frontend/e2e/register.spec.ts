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

  test('debería validar campos requeridos', async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Verificar que aparezcan mensajes de error
    await expect(page.locator('text=El nombre es requerido')).toBeVisible();
    await expect(page.locator('text=El email es requerido')).toBeVisible();
    await expect(page.locator('text=La contraseña es requerida')).toBeVisible();
  });

  test('debería validar formato de email', async ({ page }) => {
    // Llenar formulario con email inválido
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'email-invalido');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error de email
    await expect(page.locator('text=Formato de email inválido')).toBeVisible();
  });

  test('debería validar que las contraseñas coincidan', async ({ page }) => {
    // Llenar formulario con contraseñas diferentes
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password456');
    
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible();
  });

  test('debería validar longitud mínima de contraseña', async ({ page }) => {
    // Llenar formulario con contraseña muy corta
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');
    
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('text=La contraseña debe tener al menos 8 caracteres')).toBeVisible();
  });

  test('debería intentar registrar usuario con datos válidos', async ({ page }) => {
    // Interceptar la llamada al proxy
    await page.route('/api/register', async (route) => {
      // Simular respuesta exitosa del backend
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Usuario registrado exitosamente. Por favor verifica tu email.'
        })
      });
    });

    // Llenar formulario con datos válidos
    const timestamp = Date.now();
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Verificar que aparezca mensaje de éxito
    await expect(page.locator('text=Registro exitoso')).toBeVisible();
    
    // Verificar que se redirija al login después de un delay
    await page.waitForURL('/login?message=registration_success', { timeout: 5000 });
  });

  test('debería manejar error de email ya registrado', async ({ page }) => {
    // Interceptar la llamada al proxy
    await page.route('/api/register', async (route) => {
      // Simular error de email ya registrado
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Este email ya está registrado'
        })
      });
    });

    // Llenar formulario con datos válidos
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Verificar que aparezca mensaje de error
    await expect(page.locator('text=Este email ya está registrado')).toBeVisible();
  });

  test('debería manejar error de conexión', async ({ page }) => {
    // Interceptar la llamada al proxy para simular error de conexión
    await page.route('/api/register', async (route) => {
      // Simular error de conexión
      await route.abort('failed');
    });

    // Llenar formulario con datos válidos
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Verificar que aparezca mensaje de error de conexión
    await expect(page.locator('text=No se pudo contactar con el servidor')).toBeVisible();
  });
});