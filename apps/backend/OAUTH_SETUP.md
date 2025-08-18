# Configuración OAuth para el Backend AIQUAA

## 🔐 **Google OAuth - Configurado ✅**

### Credenciales:
- **Client ID**: `91995874414-kqjeag1g4h46nmlg1nodb7aqb6jud80r.apps.googleusercontent.com`
- **Client Secret**: `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`

### Variables de entorno:
```bash
GOOGLE_CLIENT_ID=91995874414-kqjeag1g4h46nmlg1nodb7aqb6jud80r.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### URLs de redirección configuradas:
- **Producción**: `https://api.aiquaa.com/api/v1/auth/google/callback`
- **Desarrollo**: `http://localhost:3000/api/v1/auth/google/callback`

## 🚀 **GitHub OAuth - Configurado ✅**

### Credenciales:
- **Client ID**: `Ov23lictkb4l9L1uwTny`
- **Client Secret**: `c1e715801f146fbb3d7899da98536dd111cd8862`

### Variables de entorno:
```bash
GITHUB_CLIENT_ID=Ov23lictkb4l9L1uwTny
GITHUB_CLIENT_SECRET=c1e715801f146fbb3d7899da98536dd111cd8862
```

### URLs de redirección configuradas:
- **Producción**: `https://api.aiquaa.com/api/v1/auth/github/callback`
- **Desarrollo**: `http://localhost:3000/api/v1/auth/github/callback`

## 📋 **Verificación de configuración**

### Variables requeridas para OAuth:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=✓ Configurado
GOOGLE_CLIENT_SECRET=✓ Configurado

# GitHub OAuth
GITHUB_CLIENT_ID=✓ Configurado
GITHUB_CLIENT_SECRET=✓ Configurado
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

1. **✅ Google OAuth configurado** - Listo para usar
2. **✅ GitHub OAuth configurado** - Listo para usar
3. **🔒 Cambiar JWT_SECRET** en producción
4. **🌐 Configurar CORS** para el dominio de producción
5. **📧 Configurar SMTP** para emails de verificación

## 🎉 **¡OAuth completamente configurado!**

Ambos proveedores OAuth (Google y GitHub) están configurados y listos para usar. Los usuarios podrán autenticarse con cualquiera de las dos opciones.
