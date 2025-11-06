# Bug Report Widget

Widget completo para reportar bugs desde cualquier página de AIQUAA Labs, con captura automática de datos técnicos, adjuntos multimedia y cola offline.

## 📋 Características

- **FAB Flotante**: Botón de acción flotante en la esquina inferior derecha
- **Modal Accesible**: Con trap de foco, navegación por teclado y soporte para ESC
- **Validación Completa**: Usando Zod y React Hook Form
- **Adjuntos Multimedia**: Soporte para imágenes, videos y archivos de texto
- **Grabación de Pantalla/Voz**: Usando MediaRecorder API
- **Datos Técnicos Automáticos**: Captura URL, navegador, viewport, timezone, etc.
- **Console Logs**: Opción de capturar errores/warnings de consola
- **Persistencia Offline**: Cola en IndexedDB para reenvíos automáticos
- **Responsive**: Funciona en móvil y desktop
- **Dark Mode**: Soporte completo para modo oscuro
- **Telemetría**: Emite eventos personalizados

## 🚀 Instalación

### Dependencias

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

### Archivos Necesarios

El widget está compuesto por:

```
src/
├── components/
│   └── BugReportWidget.tsx         # Componente principal
├── lib/
│   ├── techInfo.ts                 # Recolección de info técnica
│   ├── recorder.ts                 # MediaRecorder helpers
│   └── bugQueue.ts                 # Cola de IndexedDB
├── types/
│   └── bug.ts                      # Tipos TypeScript
└── app/
    └── api/
        └── bug-report/
            └── route.ts            # API route handler
```

## 📖 Uso

### Integración Básica

```tsx
import BugReportWidget from '@/components/BugReportWidget';

export default function MyPage() {
  return (
    <div>
      <h1>Mi Página</h1>
      {/* Tu contenido aquí */}

      {/* Widget flotante */}
      <BugReportWidget />
    </div>
  );
}
```

### Configuración de Variables de Entorno

```env
# Backend Target
BUG_REPORT_TARGET=github|azure|email|webhook

# GitHub (si target=github)
GITHUB_REPO=owner/repo
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# Azure DevOps (si target=azure)
AZURE_ORG=my-org
AZURE_PROJECT=my-project
AZURE_PAT=xxxxxxxxxxxxx

# Email (si target=email)
BUG_REPORT_EMAIL=bugs@example.com

# Webhook (si target=webhook)
BUG_REPORT_WEBHOOK_URL=https://example.com/webhook
```

## 🎨 Personalización

### Límites de Archivos

Edita las constantes en `BugReportWidget.tsx`:

```tsx
const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webm', 'mp4', 'txt', 'log'];
```

### Estilos

El widget usa Tailwind CSS. Puedes personalizar:

- **FAB Position**: Cambia `bottom-6 right-6` en el botón FAB
- **Colores**: Cambia `red-600` por otro color de Tailwind
- **Tamaño Modal**: Cambia `max-w-2xl` en el div del modal

## 🔧 API Route

### Implementación Stub (Actual)

El archivo `route.ts` actual es un stub que:
- Valida datos recibidos
- Simula un envío exitoso
- Devuelve respuesta mockup

### Implementación Real (A desarrollar)

Para implementar la integración real:

#### GitHub Issues

```typescript
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const result = await octokit.issues.create({
  owner: process.env.GITHUB_REPO!.split('/')[0],
  repo: process.env.GITHUB_REPO!.split('/')[1],
  title: title,
  body: `
## Steps to Reproduce
${stepsToReproduce}

## Expected Result
${expectedResult}

## Actual Result
${actualResult}

## Technical Info
- **Severity**: ${severity}
- **Impact**: ${impact}
- **URL**: ${technicalInfo.url}
- **Browser**: ${technicalInfo.userAgent}
- **Viewport**: ${technicalInfo.viewport.width}x${technicalInfo.viewport.height}
  `,
  labels: ['bug', severity.toLowerCase()],
});
```

#### Azure DevOps Work Items

```typescript
import * as azdev from 'azure-devops-node-api';

const authHandler = azdev.getPersonalAccessTokenHandler(process.env.AZURE_PAT!);
const connection = new azdev.WebApi(`https://dev.azure.com/${process.env.AZURE_ORG}`, authHandler);
const workItemTrackingApi = await connection.getWorkItemTrackingApi();

const patchDocument = [
  { op: 'add', path: '/fields/System.Title', value: title },
  { op: 'add', path: '/fields/System.Description', value: description },
  { op: 'add', path: '/fields/Microsoft.VSTS.Common.Severity', value: severity },
];

const workItem = await workItemTrackingApi.createWorkItem(
  null,
  patchDocument,
  process.env.AZURE_PROJECT!,
  'Bug'
);
```

#### Email (usando Resend o similar)

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'bugs@aiquaa.com',
  to: process.env.BUG_REPORT_EMAIL!,
  subject: `[Bug] ${title}`,
  html: `<h2>${title}</h2>...`,
  attachments: attachments.map(file => ({
    filename: file.name,
    content: Buffer.from(await file.arrayBuffer()),
  })),
});
```

## 📊 Telemetría

El widget emite un evento personalizado al enviar exitosamente:

```typescript
window.addEventListener('aiquaa-bug-submitted', (event: CustomEvent) => {
  console.log('Bug submitted:', event.detail);
  // { severity: 'Critical', impact: 'High' }
});
```

Úsalo para integraciones con analytics:

```typescript
window.addEventListener('aiquaa-bug-submitted', (event: CustomEvent) => {
  gtag('event', 'bug_submitted', {
    severity: event.detail.severity,
    impact: event.detail.impact,
  });
});
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
pnpm --filter @aiquaa/frontend test
```

### E2E Tests (Playwright)

```bash
# Ejecutar todos los tests del widget
pnpm --filter @aiquaa/frontend e2e -- bug-report-widget

# Ejecutar test específico
pnpm --filter @aiquaa/frontend e2e -- bug-report-widget -g "should submit successfully"
```

### Coverage

```bash
pnpm --filter @aiquaa/frontend test:cov
```

## 🔒 Seguridad

### Validación

- ✅ Validación en cliente (Zod)
- ✅ Validación en servidor (API route)
- ✅ Sanitización de archivos (extensiones, tamaño)
- ✅ Límites de rate (configurar en middleware)

### Secretos

- ❌ NUNCA exponer tokens en el frontend
- ✅ Usar variables de entorno server-side
- ✅ API route maneja autenticación
- ✅ CORS configurado correctamente

## 📱 Soporte de Navegadores

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Modal básico | ✅ | ✅ | ✅ | ✅ |
| File upload | ✅ | ✅ | ✅ | ✅ |
| Drag & drop | ✅ | ✅ | ✅ | ✅ |
| Screen recording | ✅ | ✅ | ❌ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |

*Nota: Safari no soporta `getDisplayMedia` para grabación de pantalla.*

## 🐛 Troubleshooting

### El widget no aparece

- Verifica que importaste correctamente: `import BugReportWidget from '@/components/BugReportWidget'`
- Verifica que el componente está en una página con `'use client'`

### Error de validación

- Revisa que Zod esté instalado: `pnpm list zod`
- Verifica la versión: debe ser >= 3.22

### Screen recording no funciona

- Verifica que estés en HTTPS (MediaRecorder requiere contexto seguro)
- Safari no soporta `getDisplayMedia`, muestra mensaje apropiado

### IndexedDB falla

- Verifica que el navegador soporte IndexedDB
- Revisa la consola para errores de permisos
- Limpia IndexedDB manualmente si está corrupto: DevTools > Application > IndexedDB

### CORS errors

- Verifica que la API route esté en `/api/bug-report`
- Revisa configuración de CORS en `next.config.js`

## 🎯 Roadmap

- [ ] Soporte para adjuntar capturas de pantalla directas
- [ ] Integración con Jira
- [ ] Plantillas de bugs por categoría
- [ ] Auto-categorización con IA
- [ ] Notificaciones push de estado
- [ ] Historial de bugs reportados
- [ ] Badge de "pending bugs" en el FAB

## 📝 License

MIT - Ver LICENSE en el repositorio principal.

## 👥 Contribuir

Ver CONTRIBUTING.md en el repositorio principal.

---

**Creado con ❤️ por AIQUAA para la comunidad de testers en Paraguay**
