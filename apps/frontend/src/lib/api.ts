// Usar proxy local para evitar problemas de CORS
const API = process.env.NEXT_PUBLIC_API_BASE || '';

export async function postJson(path: string, body: unknown) {
  try {
    // Para el registro, usar el proxy local
    const url =
      path === '/api/v1/auth/register'
        ? '/api/register'
        : `${process.env.NEXT_PUBLIC_API_URL || ''}${path}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      // No especificar mode para usar el modo por defecto (CORS normal)
      credentials: 'include',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('API Error:', {
        url: `${API}${path}`,
        status: res.status,
        statusText: res.statusText,
        body: text,
        timestamp: new Date().toISOString(),
      });
      throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text}`);
    }

    return res.json().catch(() => ({}));
  } catch (error) {
    // Detectar errores de red/CORS específicos
    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      console.error('Network/CORS Error:', {
        url: `${API}${path}`,
        error: 'No se pudo contactar con el servidor. Verificá conexión/CORS.',
        timestamp: new Date().toISOString(),
      });
      throw new Error(
        'No se pudo contactar con el servidor. Verificá conexión/CORS.'
      );
    }

    console.error('API Error:', {
      url: `${API}${path}`,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

export async function getJson(path: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL || ''}${path}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    // No especificar mode para usar el modo por defecto (CORS normal)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text}`);
  }

  return res.json().catch(() => ({}));
}
