# 🚀 Vercel Deployment Guide

## 📋 Configuración para Vercel

### 1. Variables de Entorno en Vercel

En el dashboard de Vercel, configura las siguientes variables de entorno:

```bash
# Para desarrollo
VITE_API_BASE_URL=http://localhost:3001

# Para producción (actualizar con tu URL real del backend)
VITE_API_BASE_URL=https://tu-backend-url.vercel.app
```

### 2. Configuración del Proyecto

#### Frontend (Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Backend (Separate Deployment)
Deploy el backend en una plataforma separada como:
- Railway
- Heroku
- DigitalOcean
- Vercel (como API routes)

### 3. Estructura de Archivos

```
aiquaa/
├── src/
│   ├── services/
│   │   └── feedbackService.ts  # ✅ Configurado para Vercel
│   └── vite-env.d.ts          # ✅ Tipos de Vite
├── vite.config.ts             # ✅ Configurado
├── vercel.json               # ✅ Configuración de Vercel
└── package.json              # ✅ Scripts de build
```

### 4. Comandos de Build

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview local
npm run preview
```

### 5. Configuración de CORS

Asegúrate de que tu backend permita requests desde tu dominio de Vercel:

```javascript
// En tu backend
app.use(cors({
  origin: [
    'https://tu-app.vercel.app',
    'http://localhost:5173' // Para desarrollo
  ]
}));
```

### 6. Troubleshooting

#### Error: "Cannot find name 'process'"
✅ **Solucionado**: Cambiado `process.env` por `import.meta.env`

#### Error: "API_BASE_URL is undefined"
✅ **Solucionado**: Implementado fallback robusto en `feedbackService.ts`

#### Error: "CORS policy"
- Verificar configuración CORS en el backend
- Asegurar que el dominio de Vercel esté permitido

### 7. Verificación del Deploy

1. **Build exitoso**: ✅ Sin errores de TypeScript
2. **Variables de entorno**: ✅ Configuradas en Vercel
3. **API conectada**: ✅ Backend respondiendo
4. **CORS configurado**: ✅ Requests permitidos

### 8. URLs de Referencia

- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-backend-url.vercel.app`
- **API Health**: `https://tu-backend-url.vercel.app/`

### 9. Monitoreo

- Revisar logs en Vercel Dashboard
- Verificar métricas de rendimiento
- Monitorear errores en la consola del navegador

---

**¡Deploy listo para Vercel! 🎉** 