# Configuración de Variables de Entorno en Vercel

## Problema Identificado

El error `ERR_FAILED` en el registro se debe a que las variables de entorno no están configuradas correctamente en Vercel. El frontend está intentando conectarse a URLs incorrectas del backend.

## Variables Requeridas en Vercel

Debes configurar las siguientes variables de entorno en el **Vercel Dashboard** para tu proyecto:

### 1. Variables de API Backend

```env
NEXT_PUBLIC_API_URL=https://aiquaabackend-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://aiquaabackend-production.up.railway.app
```

### 2. Variables de NextAuth

```env
NEXTAUTH_SECRET=<genera-un-string-aleatorio-seguro-de-minimo-32-caracteres>
NEXTAUTH_URL=https://tu-dominio-en-vercel.vercel.app
```

Para generar `NEXTAUTH_SECRET`, puedes usar:
```bash
openssl rand -base64 32
```

### 3. Variables de OAuth (Google)

```env
GOOGLE_CLIENT_ID=<tu-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<tu-google-client-secret>
```

### 4. Variables de OAuth (GitHub)

```env
GITHUB_CLIENT_ID=<tu-github-client-id>
GITHUB_CLIENT_SECRET=<tu-github-client-secret>
```

## Cómo Configurar en Vercel

### Opción 1: Desde el Dashboard de Vercel

1. Ve a tu proyecto en https://vercel.com/dashboard
2. Click en **Settings** → **Environment Variables**
3. Agrega cada variable:
   - **Key**: Nombre de la variable (ej: `NEXT_PUBLIC_API_URL`)
   - **Value**: Valor de la variable
   - **Environments**: Selecciona `Production`, `Preview`, y `Development` según necesites
4. Click en **Save**
5. **Importante**: Haz un redeploy del proyecto para que los cambios surtan efecto

### Opción 2: Usando Vercel CLI

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login
vercel login

# Configurar variables de entorno
vercel env add NEXT_PUBLIC_API_URL production
# Ingresa el valor cuando te lo pida: https://aiquaabackend-production.up.railway.app

# Repetir para cada variable
vercel env add NEXT_PUBLIC_BACKEND_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GITHUB_CLIENT_ID production
vercel env add GITHUB_CLIENT_SECRET production

# Hacer redeploy
vercel --prod
```

## Configuración del Backend en Railway

Asegúrate también de que el backend en Railway tenga configurada la URL del frontend en `FRONT_ORIGIN`:

```env
FRONT_ORIGIN=https://tu-dominio-en-vercel.vercel.app
```

Esto es necesario para que CORS funcione correctamente.

## Verificación

Después de configurar las variables:

1. Haz un nuevo deployment en Vercel
2. Verifica que el build se complete exitosamente
3. Prueba el registro de usuarios desde el frontend desplegado
4. Revisa los logs en Vercel si hay errores: **Deployments** → Click en el deployment → **Runtime Logs**

## Mejoras Implementadas

Se han implementado las siguientes mejoras para evitar este tipo de errores:

1. **Timeout configurado**: Los requests ahora tienen un timeout de 15 segundos
2. **Retry logic**: Se reintenta automáticamente 1 vez si falla
3. **Manejo mejorado de errores**: Mensajes más descriptivos para el usuario
4. **Validación de URL**: Se usa fallback a localhost en desarrollo

## Troubleshooting

### Error: "No se pudo conectar con el servidor"

- Verifica que `NEXT_PUBLIC_API_URL` esté correctamente configurada en Vercel
- Verifica que el backend en Railway esté corriendo (accede a https://aiquaabackend-production.up.railway.app/api/v1/health)
- Verifica que CORS esté configurado en el backend con tu dominio de Vercel

### Error: "El servidor tardó demasiado en responder"

- Verifica que el backend en Railway no esté en cold start
- Considera aumentar el timeout en `src/contexts/NextAuthContext.tsx`
- Revisa los logs del backend en Railway

### Error: "Este email ya está registrado"

- Este es un error esperado cuando intentas registrar un email duplicado
- El usuario debe usar el formulario de login en su lugar
