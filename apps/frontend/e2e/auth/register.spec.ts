import { test, expect } from '@playwright/test';

/**
 * Feature: Registro de usuario con credenciales
 * Como usuario nuevo
 * Quiero registrarme con email y contraseña
 * Para acceder a las herramientas de AIQUAA
 */

test.describe('Registro de Usuario', () => {
  test.beforeEach(async ({ page }) => {
    // Given: el usuario está en la página de registro
    await page.goto('/register');
  });

  test('Scenario: Registro exitoso con datos válidos', async ({ page }) => {
    // Given: el email no está registrado (asumimos backend limpio o mock)
    const timestamp = Date.now();
    const email = `nuevo.usuario${timestamp}@test.com`;

    // When: el usuario ingresa los siguientes datos
    await page.getByPlaceholder('Nombre completo').fill('Juan Pérez');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Contraseña').first().fill('Password123!');
    await page.getByPlaceholder('Confirmar contraseña').fill('Password123!');

    // And: hace click en el botón "Crear cuenta"
    const startTime = Date.now();
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Then: debe ver el mensaje de éxito
    await expect(page.getByText(/registro exitoso/i)).toBeVisible({ timeout: 15000 });

    // And: el tiempo de respuesta debe ser menor a 15 segundos
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(15000);

    // And: debe ser redirigido (o mostrar mensaje de verificación)
    await expect(page.getByText(/verifica tu email/i)).toBeVisible();
  });

  test('Scenario: Error por email ya registrado', async ({ page }) => {
    // Given: el email ya está registrado (usar un email conocido o mock)
    const existingEmail = 'existente@test.com';

    // When: el usuario ingresa los siguientes datos
    await page.getByPlaceholder('Nombre completo').fill('María López');
    await page.getByPlaceholder('Email').fill(existingEmail);
    await page.getByPlaceholder('Contraseña').first().fill('Password456!');
    await page.getByPlaceholder('Confirmar contraseña').fill('Password456!');

    // And: hace click en el botón "Registrarse"
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Then: debe ver el mensaje de error
    await expect(page.getByText(/este email ya está registrado/i)).toBeVisible();

    // And: debe permanecer en la página de registro
    await expect(page).toHaveURL(/\/register/);

    // And: debe ver un link a la página de login
    await expect(page.getByRole('link', { name: /inicia sesión/i })).toBeVisible();
  });

  test('Scenario: Error por contraseña inválida - muy corta', async ({ page }) => {
    // When: el usuario ingresa los siguientes datos
    await page.getByPlaceholder('Nombre completo').fill('Pedro García');
    await page.getByPlaceholder('Email').fill('pedro@test.com');
    await page.getByPlaceholder('Contraseña').first().fill('123');
    await page.getByPlaceholder('Confirmar contraseña').fill('123');

    // And: hace click en el botón "Registrarse"
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Then: debe ver el mensaje de error
    await expect(
      page.getByText(/la contraseña debe tener al menos 8 caracteres/i)
    ).toBeVisible();

    // And: el botón de registro debe permanecer habilitado
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeEnabled();
  });

  test('Scenario: Error por contraseña sin complejidad', async ({ page }) => {
    // When: el usuario ingresa contraseña sin mayúscula
    await page.getByPlaceholder('Nombre completo').fill('Pedro García');
    await page.getByPlaceholder('Email').fill('pedro@test.com');
    await page.getByPlaceholder('Contraseña').first().fill('password123');
    await page.getByPlaceholder('Confirmar contraseña').fill('password123');

    // And: hace click en el botón "Registrarse"
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Then: debe ver el mensaje de error de complejidad
    await expect(
      page.getByText(/la contraseña debe contener.*mayúscula.*minúscula.*número/i)
    ).toBeVisible();
  });

  test('Scenario: Error por email inválido', async ({ page }) => {
    // When: el usuario ingresa los siguientes datos
    await page.getByPlaceholder('Nombre completo').fill('Ana Martínez');
    await page.getByPlaceholder('Email').fill('email-invalido');
    await page.getByPlaceholder('Contraseña').first().fill('Password789!');
    await page.getByPlaceholder('Confirmar contraseña').fill('Password789!');

    // And: hace click en el botón "Registrarse"
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Then: debe ver el mensaje de error
    await expect(page.getByText(/correo inválido/i)).toBeVisible();

    // And: el botón de registro debe permanecer habilitado
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeEnabled();
  });

  test('Scenario: Validación de campos vacíos', async ({ page }) => {
    // When: el usuario deja todos los campos vacíos
    // And: hace click en el botón "Registrarse"
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Then: debe ver mensajes de error para cada campo
    await expect(page.getByText(/nombre obligatorio/i)).toBeVisible();
    await expect(page.getByText(/correo obligatorio/i)).toBeVisible();
    await expect(page.getByText(/contraseña obligatoria/i)).toBeVisible();
  });

  test('Scenario: Validación de contraseñas no coinciden', async ({ page }) => {
    // When: el usuario ingresa contraseñas diferentes
    await page.getByPlaceholder('Nombre completo').fill('Carlos Ruiz');
    await page.getByPlaceholder('Email').fill('carlos@test.com');
    await page.getByPlaceholder('Contraseña').first().fill('Password123!');
    await page.getByPlaceholder('Confirmar contraseña').fill('Password456!');

    // And: hace click en el botón "Registrarse"
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Then: debe ver el mensaje de error
    await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
  });

  test('Scenario: Estado de carga durante el registro', async ({ page }) => {
    // When: el usuario ingresa datos válidos
    await page.getByPlaceholder('Nombre completo').fill('Laura Sánchez');
    await page.getByPlaceholder('Email').fill(`laura${Date.now()}@test.com`);
    await page.getByPlaceholder('Contraseña').first().fill('Password123!');
    await page.getByPlaceholder('Confirmar contraseña').fill('Password123!');

    // And: hace click en el botón "Registrarse"
    const submitButton = page.getByRole('button', { name: /crear cuenta/i });
    await submitButton.click();

    // Then: el botón debe estar deshabilitado
    await expect(submitButton).toBeDisabled();

    // And: debe mostrar texto de carga
    await expect(page.getByText(/creando cuenta/i)).toBeVisible();
  });

  test('Scenario: Indicador de fuerza de contraseña - débil', async ({ page }) => {
    // When: el usuario escribe una contraseña débil
    await page.getByPlaceholder('Contraseña').first().fill('weak');

    // Then: debe ver indicador de fuerza débil
    await expect(page.getByText('Débil')).toBeVisible();

    // And: debe ver requisitos no cumplidos
    await expect(page.getByText(/mínimo 8 caracteres/i).locator('..')).toHaveClass(/text-gray-500/);
  });

  test('Scenario: Indicador de fuerza de contraseña - fuerte', async ({ page }) => {
    // When: el usuario escribe una contraseña fuerte
    await page.getByPlaceholder('Contraseña').first().fill('Strong123!');

    // Then: debe ver indicador de fuerza fuerte
    await expect(page.getByText('Fuerte')).toBeVisible();

    // And: debe ver todos los requisitos cumplidos en verde
    await expect(page.getByText(/mínimo 8 caracteres/i).locator('..')).toHaveClass(/text-green-600/);
    await expect(page.getByText(/una letra mayúscula/i).locator('..')).toHaveClass(/text-green-600/);
    await expect(page.getByText(/una letra minúscula/i).locator('..')).toHaveClass(/text-green-600/);
    await expect(page.getByText(/un número/i).locator('..')).toHaveClass(/text-green-600/);
  });

  test('Scenario: Toggle mostrar/ocultar contraseña', async ({ page }) => {
    // When: el usuario hace click en el icono de ojo
    const passwordInput = page.getByPlaceholder('Contraseña').first();
    await passwordInput.fill('MySecret123');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show
    const toggleButton = page.getByRole('button', { name: /mostrar contraseña/i }).first();
    await toggleButton.click();

    // Then: la contraseña debe estar visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle to hide again
    const hideButton = page.getByRole('button', { name: /ocultar contraseña/i }).first();
    await hideButton.click();

    // Then: la contraseña debe estar oculta
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Scenario: Navegación a página de login', async ({ page }) => {
    // When: el usuario hace click en el link de login
    await page.getByRole('link', { name: /inicia sesión/i }).click();

    // Then: debe ser redirigido a la página de login
    await expect(page).toHaveURL(/\/login/);
  });

  test('Scenario: OAuth - Google (visual verification)', async ({ page }) => {
    // When: el usuario hace click en el botón de Google
    const googleButton = page.getByRole('button', { name: /registrarse con google/i });

    // Then: el botón debe estar visible y habilitado
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();

    // Verificar que tiene el icono de Google
    await expect(googleButton.locator('svg')).toBeVisible();
  });

  test('Scenario: OAuth - GitHub (visual verification)', async ({ page }) => {
    // When: el usuario hace click en el botón de GitHub
    const githubButton = page.getByRole('button', { name: /registrarse con github/i });

    // Then: el botón debe estar visible y habilitado
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toBeEnabled();

    // Verificar que tiene el icono de GitHub
    await expect(githubButton.locator('svg')).toBeVisible();
  });
});

/**
 * Test de accesibilidad (a11y)
 */
test.describe('Accesibilidad del Registro', () => {
  test('debe tener etiquetas aria correctas', async ({ page }) => {
    await page.goto('/register');

    // Verificar aria-labels en botones de toggle
    const toggleButtons = page.getByRole('button', { name: /mostrar contraseña/i });
    await expect(toggleButtons.first()).toHaveAttribute('aria-label', /mostrar contraseña/i);
  });

  test('debe ser navegable con teclado', async ({ page }) => {
    await page.goto('/register');

    // Tab through all form fields
    await page.keyboard.press('Tab'); // Name
    await page.keyboard.press('Tab'); // Email
    await page.keyboard.press('Tab'); // Password
    await page.keyboard.press('Tab'); // Password toggle
    await page.keyboard.press('Tab'); // Confirm password
    await page.keyboard.press('Tab'); // Confirm password toggle
    await page.keyboard.press('Tab'); // Submit button

    // Verificar que el botón de submit tiene focus
    const submitButton = page.getByRole('button', { name: /crear cuenta/i });
    await expect(submitButton).toBeFocused();
  });
});

/**
 * Test de rendimiento
 */
test.describe('Rendimiento del Registro', () => {
  test('carga inicial debe ser rápida', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/register');

    // Esperar a que todos los elementos críticos estén visibles
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();

    const loadTime = Date.now() - startTime;

    // La página debe cargar en menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });
});
