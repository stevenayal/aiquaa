# Configuración de la API

## Archivos de Configuración

### Variables de Entorno

#### Desarrollo (`env.development`)
```
VITE_API_URL=http://localhost:3001
```

#### Producción (`env.production`)
```
VITE_API_URL=https://api.aiquaa.com
```

## Uso en el Código

### 1. Importar la configuración
```typescript
import { API_URL, apiRequest } from '../config/apiConfig';
```

### 2. Usar directamente la URL
```typescript
// Ejemplo básico
export async function getGastos() {
  const res = await fetch(`${API_URL}/gastos`);
  if (!res.ok) throw new Error("Error al obtener gastos");
  return res.json();
}
```

### 3. Usar la función helper
```typescript
// Ejemplo con helper
export async function getGastosWithHelper() {
  const response = await apiRequest('/gastos');
  return response.json();
}
```

## Estructura de Archivos

- `src/config/apiConfig.ts` - Configuración principal de la API
- `src/config/api.ts` - Configuración legacy (mantenida por compatibilidad)
- `src/services/apiService.ts` - Servicios de API de ejemplo
- `env.development` - Variables de entorno para desarrollo
- `env.production` - Variables de entorno para producción

## Verificación de CORS

Para verificar que CORS funcione correctamente:

1. **Desarrollo**: El backend debe estar configurado para aceptar requests desde `http://localhost:5173` (Vite dev server)
2. **Producción**: El backend debe estar configurado para aceptar requests desde `https://aiquaa.com`

## Comandos de Verificación

```bash
# Verificar conexión al backend de desarrollo
curl http://localhost:3001/health

# Verificar conexión al backend de producción
curl https://api.aiquaa.com/health
```

## Notas Importantes

- Este endpoint está conectado al backend desplegado en https://api.aiquaa.com
- Las variables de entorno deben comenzar con `VITE_` para ser accesibles en el frontend
- El archivo `.env.local` puede ser usado para configuraciones locales específicas
