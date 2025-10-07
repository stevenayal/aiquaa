import { test, expect } from '@playwright/test';

test.describe('Conectividad del backend', () => {
  test('debería responder al health check', async ({ page }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aiquaabackend-production.up.railway.app';
    
    // Hacer request directo al health check
    const response = await page.request.get(`${apiUrl}/health`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('time');
    expect(data).toHaveProperty('uptime');
  });

  test('debería manejar CORS correctamente', async ({ page }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aiquaabackend-production.up.railway.app';
    
    // Hacer request OPTIONS para verificar CORS
    const response = await page.request.options(`${apiUrl}/api/v1/auth/register`, {
      headers: {
        'Origin': 'https://aiquaa.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    expect(response.status()).toBe(204);
    
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toContain('aiquaa.com');
    expect(headers['access-control-allow-methods']).toContain('POST');
    expect(headers['access-control-allow-headers']).toContain('Content-Type');
  });

  test('debería rechazar requests de orígenes no permitidos', async ({ page }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aiquaabackend-production.up.railway.app';
    
    // Hacer request con origen no permitido
    const response = await page.request.post(`${apiUrl}/api/v1/auth/register`, {
      headers: {
        'Origin': 'https://malicious-site.com',
        'Content-Type': 'application/json'
      },
      data: {
        name: 'Test',
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    // Debería fallar por CORS
    expect(response.status()).toBe(0); // CORS error
  });
});
