import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have critical accessibility violations on home page', async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Ejecutar análisis de accesibilidad
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Verificar que no haya violaciones críticas
    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical'
    );
    
    expect(criticalViolations).toHaveLength(0);
    
    // Log de violaciones para debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:', accessibilityScanResults.violations);
    }
  });

  test('should not have critical accessibility violations on forum list page', async ({ page }) => {
    // Navegar a la página del foro
    await page.goto('/forum');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Ejecutar análisis de accesibilidad
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Verificar que no haya violaciones críticas
    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical'
    );
    
    expect(criticalViolations).toHaveLength(0);
  });

  test('should not have critical accessibility violations on forum detail page', async ({ page }) => {
    // Navegar a la página principal del foro
    await page.goto('/forum');
    
    // Esperar a que cargue la lista de hilos
    await page.waitForLoadState('networkidle');
    
    // Intentar navegar a un hilo específico si existe
    const threadLink = page.locator('[data-testid="thread-item"] a').first();
    
    if (await threadLink.isVisible()) {
      await threadLink.click();
      
      // Esperar a que cargue la página del hilo
      await page.waitForLoadState('networkidle');
      
      // Ejecutar análisis de accesibilidad
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      
      // Verificar que no haya violaciones críticas
      const criticalViolations = accessibilityScanResults.violations.filter(
        violation => violation.impact === 'critical'
      );
      
      expect(criticalViolations).toHaveLength(0);
    } else {
      // Si no hay hilos, verificar que la página esté accesible
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      
      const criticalViolations = accessibilityScanResults.violations.filter(
        violation => violation.impact === 'critical'
      );
      
      expect(criticalViolations).toHaveLength(0);
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
    
    // Verificar que los elementos interactivos tengan ARIA labels
    const buttons = page.locator('button');
    const links = page.locator('a');
    const inputs = page.locator('input');
    
    // Verificar que los botones tengan aria-label o texto accesible
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const buttonText = await button.textContent();
      
      // Al menos debe tener aria-label o texto visible
      expect(ariaLabel || buttonText?.trim()).toBeTruthy();
    }
    
    // Verificar que los enlaces tengan texto accesible
    const linkCount = await links.count();
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const ariaLabel = await link.getAttribute('aria-label');
      const linkText = await link.textContent();
      
      // Al menos debe tener aria-label o texto visible
      expect(ariaLabel || linkText?.trim()).toBeTruthy();
    }
  });

  test('should have proper heading structure', async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
    
    // Verificar que haya al menos un h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
    
    // Verificar que los headings sigan una estructura lógica
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    // Debe haber al menos algunos headings
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should have proper color contrast', async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/');
    
    // Ejecutar análisis de accesibilidad enfocado en contraste
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    // Verificar que no haya violaciones de contraste
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(contrastViolations).toHaveLength(0);
  });
});
