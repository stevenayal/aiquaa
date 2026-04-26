# AIQUAA Design Refresh — Patch Pack

Mejoras visuales + nuevo flujo Candidato/Empresa para `stevenayal/aiquaa`.

## ¿Qué incluye?

| Archivo | Cambio | Riesgo |
|---|---|---|
| `apps/frontend/src/components/LogoMark.tsx` | **NUEVO** — logo SVG inline, color/size por props | 🟢 Cero |
| `apps/frontend/src/components/auth/AudienceToggle.tsx` | **NUEVO** — segmented control Candidato/Empresa | 🟢 Cero |
| `apps/frontend/src/components/auth/AuthForm.tsx` | Reemplazo — usa LogoMark + audience toggle + campo empresa | 🟡 Bajo |
| `apps/frontend/src/components/auth/RegisterForm.tsx` | Reemplazo — agrega `audience` + `companyName` al state | 🟡 Bajo |
| `apps/frontend/src/components/Header.tsx` | Reemplazo — logo circular + tagline | 🟢 Cero |
| `apps/frontend/src/app/page.tsx` | Reemplazo — hero usa LogoMark en lugar de `<img>` | 🟢 Cero |
| `apps/frontend/src/actions/auth.ts` | Reemplazo — `registerAction` acepta audience + companyName | 🟠 Medio |
| `supabase/migrations/...sql` | **NUEVO** — agrega columnas `audience` y `company_name` | 🔴 Requiere migración |

> ✅ El logo `/images/logo1.png` y otros PNGs **siguen funcionando** — no los borres todavía. Si querés sacarlos, después confirmá con grep.

## Cómo aplicar

### Paso 1 — Copiar archivos
Cada archivo está en la ruta exacta donde debe ir. Desde la raíz del repo:

```bash
# Asumiendo que descomprimiste el zip en ~/aiquaa-patch/
cp -r ~/aiquaa-patch/apps ./
cp -r ~/aiquaa-patch/supabase ./
```

### Paso 2 — Verificar imports
`AuthForm.tsx` ahora importa `AudienceToggle` y `LogoMark`. Si tu `tsconfig.json` no tiene el alias `@/` mapeado a `apps/frontend/src/`, ajustá los paths a relativos.

### Paso 3 — Tipografía Sora (opcional pero recomendado)
Sora ya está importado en `globals.css`. Para usarlo como font default reemplazá en `layout.tsx`:

```diff
- import { Inter } from 'next/font/google';
- const inter = Inter({ subsets: ['latin'] });
+ import { Sora } from 'next/font/google';
+ const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

- <body className={inter.className}>
+ <body className={sora.className}>
```

### Paso 4 — Migración de base de datos

```bash
# Local
supabase db push

# O ejecutá manualmente el SQL de:
# supabase/migrations/20260101000000_add_audience_and_company.sql
```

⚠️ **El trigger `handle_new_user` del SQL es genérico** — adaptalo a tu schema real. Verificá que el nombre de la tabla sea `profiles` (o ajustá).

### Paso 5 — RLS (opcional)
Al final del SQL hay un policy comentado para que **empresas** no puedan enviar intentos de examen. Adaptalo a tus policies actuales.

### Paso 6 — Probar

```bash
cd apps/frontend
pnpm dev
```

Visitá:
- `/` → hero con logo circular nuevo
- `/login` → logo circular en lugar del cuadrado con 🎯
- `/register` → toggle Candidato / Empresa al inicio del formulario

## Checklist post-deploy

- [ ] Header muestra el átomo blanco circular sobre el fondo oscuro
- [ ] Login muestra logo circular sin emoji 🎯
- [ ] Registro arranca con toggle Candidato (default) / Empresa
- [ ] Al elegir Empresa: cambia label a "Email corporativo" + aparece campo "Nombre de la empresa" + se oculta selector de rol
- [ ] Tras registrarse como empresa, en Supabase `profiles.audience = 'empresa'` y `company_name` se persiste
- [ ] Hero del home muestra el átomo + wordmark "aiquaa" + tagline en círculo translúcido

## Rollback

```bash
git revert <commit-sha>
```

Y para la BD:

```sql
alter table public.profiles drop column if exists audience;
alter table public.profiles drop column if exists company_name;
drop type if exists audience_type;
```

## Próximos pasos sugeridos

1. **Página `/employer`** — dashboard para empresas (búsqueda de candidatos por rol, filtros por puntaje ISTQB)
2. **Email de bienvenida diferenciado** por audience (template "candidato" vs "empresa")
3. **Onboarding de empresa** — paso post-confirmación con: tamaño de empresa, sector, sitio web
4. **Borrar PNGs viejos** una vez verificado en producción:
   `/public/images/logo1.png`, `logo2.png`, etc. → reemplazar por LogoMark inline
