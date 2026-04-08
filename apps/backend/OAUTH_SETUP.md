# Configuración OAuth para el Backend AIQUAA

## 🔐 **Google OAuth**

### Credenciales:
- **Client ID**: configúralo en variables de entorno
- **Client Secret**: configúralo en variables de entorno

### Variables de entorno:
```bash
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret
```

### URLs de redirección configuradas:
- **Producción**: `https://api.aiquaa.com/api/v1/auth/google/callback`
- **Desarrollo**: `http://localhost:3001/api/v1/auth/google/callback`

## 🚀 **GitHub OAuth**

### Credenciales:
- **Client ID**: configúralo en variables de entorno
- **Client Secret**: configúralo en variables de entorno

### Variables de entorno:
```bash
GITHUB_CLIENT_ID=replace-with-github-client-id
GITHUB_CLIENT_SECRET=replace-with-github-client-secret
```

### URLs de redirección configuradas:
- **Producción**: `https://api.aiquaa.com/api/v1/auth/github/callback`
- **Desarrollo**: `http://localhost:3001/api/v1/auth/github/callback`

## 📋 **Verificación de configuración**

### Variables requeridas para OAuth:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=replace-with-github-client-id
GITHUB_CLIENT_SECRET=replace-with-github-client-secret
```

## 🔧 **Endpoints OAuth disponibles**

### Google:
- **Inicio**: `GET /api/v1/auth/google`
- **Callback**: `GET /api/v1/auth/google/callback`

### GitHub:
- **Inicio**: `GET /api/v1/auth/github`
- **Callback**: `GET /api/v1/auth/github/callback`

## 🎯 **Flujo de autenticación**

1. **Usuario hace clic en botón OAuth**
2. **Frontend redirige a**: `/api/v1/auth/google` o `/api/v1/auth/github`
3. **Backend redirige al proveedor** (Google/GitHub)
4. **Usuario se autentica** en el proveedor
5. **Proveedor redirige a**: `/api/v1/auth/google/callback` o `/api/v1/auth/github/callback`
6. **Backend procesa respuesta** y genera JWT tokens
7. **Backend redirige al frontend** con tokens en la URL
8. **Frontend procesa tokens** y autentica al usuario

## ⚠️ **Notas importantes**

- **JWT_SECRET**: Cambia el valor por defecto en producción
- **CORS**: Asegúrate de que `FRONT_ORIGIN` esté configurado correctamente
- **HTTPS**: En producción, todas las URLs deben usar HTTPS
- **Variables de entorno**: Nunca commits credenciales reales al repositorio

## 🚀 **Próximos pasos**

1. Configurar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
2. Configurar `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`
3. Configurar `BACKEND_URL` y `FRONT_ORIGIN`
4. Cambiar `JWT_SECRET` por un secreto fuerte
5. Validar CORS y cookies en el dominio real

## 🎉 **OAuth listo para configurarse**

Cuando completes las variables de entorno reales, los usuarios podrán autenticarse con Google o GitHub usando los endpoints del backend.
