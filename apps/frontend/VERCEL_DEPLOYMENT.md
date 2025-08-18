# Despliegue en Vercel

## Configuración de Variables de Entorno

Para que el frontend funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno en el dashboard de Vercel:

### Variables Requeridas

1. **NEXT_PUBLIC_API_URL**
   - Valor: `https://api.aiquaa.com`
   - Descripción: URL de la API del backend

2. **NEXT_PUBLIC_BACKEND_URL**
   - Valor: `https://api.aiquaa.com`
   - Descripción: URL alternativa del backend

### Variables Opcionales

3. **NEXT_PUBLIC_GA_MEASUREMENT_ID**
   - Valor: Tu ID de Google Analytics (ej: `G-XXXXXXXXXX`)
   - Descripción: ID para Google Analytics 4

4. **NEXT_PUBLIC_SENTRY_DSN**
   - Valor: Tu DSN de Sentry
   - Descripción: Para monitoreo de errores

5. **REVALIDATE_TOKEN**
   - Valor: Token secreto para revalidación de caché
   - Descripción: Para la API de revalidación

## Cómo Configurar en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Navega a **Settings** → **Environment Variables**
3. Agrega cada variable con su valor correspondiente
4. Asegúrate de que estén configuradas para **Production**, **Preview** y **Development**

## Solución de Problemas

### Error: "NEXT_PUBLIC_API_URL no está configurada en producción"

Este error ocurre cuando las variables de entorno no están configuradas correctamente en Vercel.

**Solución:**
1. Verifica que `NEXT_PUBLIC_API_URL` esté configurada en Vercel
2. Asegúrate de que el valor sea correcto (ej: `https://api.aiquaa.com`)
3. Redespliega la aplicación después de configurar las variables

### Build Fallando

Si el build falla durante la generación estática:

1. Verifica que todas las variables requeridas estén configuradas
2. Asegúrate de que las URLs sean accesibles
3. Revisa los logs de build en Vercel para más detalles

## Notas Importantes

- Las variables que empiezan con `NEXT_PUBLIC_` son accesibles en el cliente
- Las variables sin `NEXT_PUBLIC_` solo están disponibles en el servidor
- Después de cambiar las variables de entorno, es necesario redesplegar la aplicación
- Para desarrollo local, copia `env.local.example` a `.env.local` y configura los valores
