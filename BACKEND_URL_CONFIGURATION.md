# 🔧 Configuración de URL del Backend

## 📋 Problema Resuelto

El frontend ahora está configurado correctamente para conectarse al backend en lugar de usar la URL de ejemplo `https://your-backend-url.com`.

## ✅ Cambios Realizados

### 1. Frontend (`src/services/feedbackService.ts`)
- ✅ Actualizada la URL de producción a `https://api.aiquaa.com`
- ✅ Mantenido el fallback a `http://localhost:3001` para desarrollo
- ✅ Configuración flexible con variables de entorno

### 2. Backend (`backend/src/index.ts`)
- ✅ Configurado CORS para permitir dominios específicos:
  - `http://localhost:5173` (desarrollo)
  - `http://localhost:3000` (desarrollo alternativo)
  - `https://aiquaa.com` (producción)
  - `https://www.aiquaa.com` (producción con www)
  - `https://aiquaa.vercel.app` (Vercel)

## 🚀 Configuración por Entorno

### Desarrollo Local
```bash
# Frontend (puerto 5173)
npm run dev

# Backend (puerto 3001)
cd backend
npm run dev
```

### Producción
El frontend se conectará automáticamente a `https://api.aiquaa.com` en producción.

## 🔧 Variables de Entorno

### Frontend
Crear archivo `.env.local` en la raíz del proyecto:
```env
# Para desarrollo
VITE_API_BASE_URL=http://localhost:3001

# Para producción
VITE_API_BASE_URL=https://api.aiquaa.com
```

### Backend
Crear archivo `.env` en la carpeta `backend/`:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/aiquaa_db"
PORT=3001
```

## 🧪 Testing

### Probar conexión al backend
```bash
# Ejecutar script de prueba
node test-backend-connection.js
```

### Probar desde el navegador
1. Abrir consola del navegador (F12)
2. Ir a la página de comentarios
3. Intentar enviar un comentario
4. Verificar en Network que la URL sea correcta
5. Confirmar que reciba respuesta 201

## 📡 Endpoints Disponibles

### Backend Local (http://localhost:3001)
- `GET /` - Health check
- `POST /api/comments` - Crear comentario
- `GET /api/comments` - Obtener comentarios
- `POST /api/feedback` - Crear feedback
- `GET /api/feedback` - Obtener feedback
- `GET /api/feedback/metrics` - Obtener métricas

### Documentación API
- `GET /api-docs` - Swagger UI

## 🔍 Verificación

### 1. Verificar que el backend esté corriendo
```bash
curl http://localhost:3001/
# Debe responder: "API Aiquaa funcionando 🚀"
```

### 2. Verificar CORS
```bash
curl -H "Origin: https://aiquaa.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:3001/api/comments
```

### 3. Probar endpoint de comentarios
```bash
curl -X POST http://localhost:3001/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "message": "Comentario de prueba",
    "isAnonymous": false
  }'
```

## 🚨 Troubleshooting

### Error: "Cannot connect to backend"
1. Verificar que el backend esté corriendo en puerto 3001
2. Verificar que no haya firewall bloqueando el puerto
3. Verificar la URL en `feedbackService.ts`

### Error: "CORS policy"
1. Verificar que el dominio del frontend esté en la lista de CORS
2. Verificar que el backend esté configurado correctamente
3. Verificar que esté usando HTTPS en producción

### Error: "API_BASE_URL is undefined"
1. Verificar que el archivo `.env.local` esté configurado
2. Verificar que la variable `VITE_API_BASE_URL` esté definida
3. Reiniciar el servidor de desarrollo

## 📝 Próximos Pasos

1. **Desplegar backend**: Asegurar que `https://api.aiquaa.com` esté funcionando
2. **Configurar SSL**: Habilitar HTTPS en el backend
3. **Monitoreo**: Implementar logging y monitoreo de errores
4. **Rate limiting**: Implementar límites de velocidad para prevenir spam

---

**¡Configuración completada! 🎉** 