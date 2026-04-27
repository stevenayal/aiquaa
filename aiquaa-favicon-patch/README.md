# Favicon AIQUAA — Patch

## Archivos
- `favicon.svg` → `apps/frontend/public/favicon.svg`
- `favicon-64.png` → `apps/frontend/public/favicon-64.png`
- `favicon-512.png` → `apps/frontend/public/favicon-512.png`

## Editar `apps/frontend/src/app/layout.tsx`

Agregá el bloque `icons` dentro del objeto `metadata`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aiquaa.com'),
  title: {
    default: 'AIQUAA - Comunidad y Herramientas de QA en Paraguay',
    template: '%s | AIQUAA',
  },
  description: '...',

  // 👇 AGREGAR
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/favicon-512.png',
    shortcut: '/favicon.svg',
  },

  // ...resto del metadata
};
```

## ⚠️ Borrar favicon viejo

Si existe `apps/frontend/src/app/favicon.ico` o `apps/frontend/public/favicon.ico`, borralos — Next.js les da precedencia sobre el `metadata.icons`.

## Testear

```bash
pnpm dev
```

Hard reload con **Ctrl+Shift+R** (los browsers cachean favicons fuerte).
