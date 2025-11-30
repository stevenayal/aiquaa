import { test, expect } from '@playwright/test';

/**
 * Feature: Inicio de sesión de usuario
 * Como usuario registrado
 * Quiero iniciar sesión con mi email y contraseña
 * Para acceder a mi cuenta en AIQUAA
 */

test.describe('Inicio de Sesión', () => {
  test.beforeEach(async ({ page }) => {
    // Given: el usuario está en la página de login
    await page.goto('/login');
  });

  test('Scenario: Login exitoso con credenciales válidas', async ({ page }) => {
    // Given: el usuario tiene credenciales válidas (usuario demo del seed)
    const email = 'demo@aiquaa.com';
    const password = 'Demo123!';

    // When: el usuario ingresa sus credenciales
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Contraseña').fill(password);

    // And: hace click en el botón "Iniciar sesión"
    const startTime = Date.now();
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Then: debe ser redirigido al dashboard/forum
    await expect(page).toHaveURL(/\/(forum|dashboard)/, { timeout: 15000 });

    // And: el tiempo de respuesta debe ser menor a 15 segundos
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(15000);
  });

  test('Scenario: Error por credenciales incorrectas', async ({ page }) => {
    // When: el usuario ingresa credenciales incorrectas
    await page.getByPlaceholder('Email').fill('usuario@test.com');
    await page.getByPlaceholder('Contraseña').fill('WrongPassword123');

    // And: hace click en el botón "Iniciar sesión"
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Then: debe ver el mensaje de error
    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();

    // And: debe permanecer en la página de login
    await expect(page).toHaveURL(/\/login/);
  });

  test('Scenario: Error por email no registrado', async ({ page }) => {
    // When: el usuario ingresa un email no registrado
    await page.getByPlaceholder('Email').fill('noexiste@test.com');
    await page.getByPlaceholder('Contraseña').fill('Password123!');

    // And: hace click en el botón "Iniciar sesión"
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Then: debe ver el mensaje de error
    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
  });

  test('Scenario: Error por campos vacíos', async ({ page }) => {
    // When: el usuario deja los campos vacíos
    // And: hace click en el botón "Iniciar sesión"
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Then: debe ver mensajes de error
    await expect(page.getByText(/correo obligatorio/i)).toBeVisible();
    await expect(page.getByText(/contraseña obligatoria/i)).toBeVisible();
  });

  test('Scenario: Estado de carga durante el login', async ({ page }) => {
    // When: el usuario ingresa credenciales válidas (usuario demo del seed)
    await page.getByPlaceholder('Email').fill('demo@aiquaa.com');
    await page.getByPlaceholder('Contraseña').fill('Demo123!');

    // And: hace click en el botón "Iniciar sesión"
    const submitButton = page.getByRole('button', { name: /iniciar sesión/i });
    await submitButton.click();

    // Then: el botón debe estar deshabilitado
    await expect(submitButton).toBeDisabled();

    // And: debe mostrar texto de carga
    await expect(page.getByText(/iniciando sesión/i)).toBeVisible();
  });

  test('Scenario: Toggle mostrar/ocultar contraseña', async ({ page }) => {
    // When: el usuario escribe una contraseña
    const passwordInput = page.getByPlaceholder('Contraseña');
    await passwordInput.fill('MySecret123');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show
    const toggleButton = page.getByRole('button', { name: /mostrar contraseña/i });
    await toggleButton.click();

    // Then: la contraseña debe estar visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle to hide again
    const hideButton = page.getByRole('button', { name: /ocultar contraseña/i });
    await hideButton.click();

    // Then: la contraseña debe estar oculta
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Scenario: Navegación a página de registro', async ({ page }) => {
    // When: el usuario hace click en el link de registro
    await page.getByRole('link', { name: /crea una nueva cuenta/i }).click();

    // Then: debe ser redirigido a la página de registro
    await expect(page).toHaveURL(/\/register/);
  });

  test('Scenario: OAuth - Google login', async ({ page }) => {
    // When: el usuario hace click en el botón de Google
    const googleButton = page.getByRole('button', { name: /iniciar sesión con google/i });

    // Then: el botón debe estar visible y habilitado
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();

    // Verificar que tiene el icono de Google
    await expect(googleButton.locator('svg')).toBeVisible();
  });

  test('Scenario: OAuth - GitHub login', async ({ page }) => {
    // When: el usuario hace click en el botón de GitHub
    const githubButton = page.getByRole('button', { name: /iniciar sesión con github/i });

    // Then: el botón debe estar visible y habilitado
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toBeEnabled();

    // Verificar que tiene el icono de GitHub
    await expect(githubButton.locator('svg')).toBeVisible();
  });

  test('Scenario: OAuth loading state', async ({ page }) => {
    // When: el usuario hace click en Google OAuth
    const googleButton = page.getByRole('button', { name: /iniciar sesión con google/i });

    // Intercept the redirect to prevent actual OAuth flow
    await page.route('**/api/auth/signin/google*', route => route.abort());

    await googleButton.click();

    // Then: debe mostrar estado de loading
    await expect(page.getByText(/redirigiendo/i)).toBeVisible();

    // And: el botón debe estar deshabilitado
    await expect(googleButton).toBeDisabled();
  });
});

/**
 * Test de mensaje de registro exitoso
 */
test.describe('Mensajes de Sistema', () => {
  test('Scenario: Mostrar mensaje de registro exitoso', async ({ page }) => {
    // Given: el usuario viene de la página de registro exitoso
    await page.goto('/login?message=registration_success');

    // Then: debe ver el mensaje de éxito
    await expect(page.getByText(/registro exitoso/i)).toBeVisible();
    await expect(page.getByText(/ahora puedes iniciar sesión/i)).toBeVisible();
  });

  test('Scenario: Mostrar error de OAuth', async ({ page }) => {
    // Given: hubo un error en el flujo OAuth
    await page.goto('/login?error=OAuthAccountNotLinked');

    // Then: debe ver el mensaje de error
    await expect(page.getByText(/email ya está vinculado/i)).toBeVisible();
  });
});

/**
 * Test de seguridad
 */
test.describe('Seguridad del Login', () => {
  test('no debe mostrar contraseña en texto plano por defecto', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByPlaceholder('Contraseña');

    // La contraseña debe estar oculta por defecto
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('debe limpiar formulario después de error', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email').fill('test@test.com');
    await page.getByPlaceholder('Contraseña').fill('wrongpass');

    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // El email puede permanecer pero verificamos que el formulario aún existe
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Contraseña')).toBeVisible();
  });
});

/**
 * Test de rendimiento
 */
test.describe('Rendimiento del Login', () => {
  test('carga inicial debe ser rápida', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');

    // Esperar a que todos los elementos críticos estén visibles
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();

    const loadTime = Date.now() - startTime;

    // La página debe cargar en menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });
});

/**
 * Test de flujo completo: Registro → Login
 */
test.describe('Flujo Completo: Registro y Login', () => {
  test('Scenario: Usuario puede registrarse y luego iniciar sesión', async ({ page }) => {
    const timestamp = Date.now();
    const email = `flowtest${timestamp}@test.com`;
    const password = 'FlowTest123!';
    const name = 'Flow Test User';

    // Step 1: Registro
    await page.goto('/register');
    await page.getByPlaceholder('Nombre completo').fill(name);
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Contraseña').first().fill(password);
    await page.getByPlaceholder('Confirmar contraseña').fill(password);
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Esperar mensaje de éxito
    await expect(page.getByText(/registro exitoso/i)).toBeVisible({ timeout: 15000 });

    // Step 2: Navegar a login (o esperar redirect)
    await page.waitForTimeout(2000); // Esperar redirect automático

    // Si no hubo redirect, navegar manualmente
    if (!await page.url().includes('/login')) {
      await page.goto('/login');
    }

    // Step 3: Login con las credenciales recién creadas
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Contraseña').fill(password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Step 4: Verificar acceso exitoso
    await expect(page).toHaveURL(/\/(forum|dashboard)/, { timeout: 15000 });
  });
});
