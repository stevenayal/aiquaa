// Configuración de la API
// Este archivo está conectado al backend desplegado en https://api.aiquaa.com

export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://api.aiquaa.com' 
    : 'http://localhost:3001');

// Función helper para construir URLs completas de la API
export const buildApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Configuración de headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Función helper para hacer requests a la API
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  const config: RequestInit = {
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
  }
  
  return response;
};
