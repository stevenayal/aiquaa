import { test, expect } from '@playwright/test';

test.describe('Forum CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal del foro
    await page.goto('/forum');
  });

  test('should list threads without authentication', async ({ page }) => {
    // Verificar que se muestre la lista de hilos
    await expect(page.locator('[data-testid="thread-list"]')).toBeVisible();
    
    // Verificar que haya al menos un hilo o mensaje de "no threads"
    const threadList = page.locator('[data-testid="thread-item"]');
    const noThreadsMessage = page.locator('text=No threads found');
    
    await expect(threadList.first().or(noThreadsMessage)).toBeVisible();
  });

  test('should show 401 when trying to create thread without login', async ({ page }) => {
    // Intentar crear un nuevo hilo
    await page.click('[data-testid="create-thread-button"]');
    
    // Verificar que se muestre un mensaje de error o redirección a login
    const errorMessage = page.locator('text=Unauthorized').or(page.locator('text=401'));
    const loginRedirect = page.locator('text=Login').or(page.locator('text=Sign in'));
    
    await expect(errorMessage.or(loginRedirect)).toBeVisible();
  });

  test('should create thread with valid authentication', async ({ page }) => {
    // Mock de autenticación (simular login)
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'fake-jwt-token');
    });
    
    // Recargar la página con el token
    await page.reload();
    
    // Crear un nuevo hilo
    await page.click('[data-testid="create-thread-button"]');
    
    // Llenar el formulario
    await page.fill('[data-testid="thread-title"]', 'Test Thread Title');
    await page.fill('[data-testid="thread-content"]', 'Test thread content');
    
    // Enviar el formulario
    await page.click('[data-testid="submit-thread"]');
    
    // Verificar que se haya creado el hilo
    await expect(page.locator('text=Test Thread Title')).toBeVisible();
  });

  test('should reply to thread', async ({ page }) => {
    // Mock de autenticación
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'fake-jwt-token');
    });
    
    await page.reload();
    
    // Navegar a un hilo específico
    await page.click('[data-testid="thread-item"]').first();
    
    // Agregar una respuesta
    await page.fill('[data-testid="reply-content"]', 'Test reply content');
    await page.click('[data-testid="submit-reply"]');
    
    // Verificar que se haya agregado la respuesta
    await expect(page.locator('text=Test reply content')).toBeVisible();
  });

  test('should validate pagination', async ({ page }) => {
    // Verificar que exista paginación si hay muchos hilos
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      // Verificar que se pueda navegar a la siguiente página
      const nextButton = page.locator('[data-testid="next-page"]');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        
        // Verificar que la URL cambie
        await expect(page).toHaveURL(/page=2/);
      }
    }
  });

  test('should show 403 for insufficient permissions', async ({ page }) => {
    // Mock de token con permisos insuficientes
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'fake-jwt-token-limited');
    });
    
    await page.reload();
    
    // Intentar acceder a funcionalidad restringida
    await page.click('[data-testid="admin-button"]');
    
    // Verificar que se muestre error 403
    const errorMessage = page.locator('text=Forbidden').or(page.locator('text=403'));
    await expect(errorMessage).toBeVisible();
  });
});
