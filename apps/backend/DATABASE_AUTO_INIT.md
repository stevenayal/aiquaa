# Sistema de Auto-Inicialización de Base de Datos

## Resumen

El backend de AIQUAA ahora cuenta con un **sistema automático de inicialización de base de datos** que se ejecuta al iniciar el servidor. Este sistema garantiza que:

✅ **Las tablas se crean automáticamente** si no existen
✅ **Los datos iniciales se insertan** (usuarios demo, categorías)
✅ **Es idempotente**: se puede ejecutar múltiples veces sin problemas
✅ **Detecta datos existentes** y no los duplica
✅ **Es compatible con Railway, Vercel, Heroku** y cualquier plataforma
✅ **No requiere intervención manual** después del deployment

---

## 🚀 Cómo Funciona

Cuando el backend se inicia en producción (Railway, por ejemplo), automáticamente:

1. **Verifica la conexión** a PostgreSQL
2. **Genera el cliente de Prisma** (si no existe)
3. **Crea todas las tablas** usando el schema de Prisma
4. **Verifica si ya hay datos** (usuarios, categorías)
5. **Inserta datos iniciales** solo si la base de datos está vacía
6. **Inicia el servidor NestJS**

Todo esto ocurre **automáticamente en cada deployment**, sin necesidad de ejecutar comandos manuales.

---

## 📁 Archivos del Sistema

### Script Principal: `scripts/init-database.js`

Este script Node.js ejecuta todo el proceso de inicialización:

```javascript
// 1. Verifica conexión a PostgreSQL
await checkDatabaseConnection();

// 2. Genera cliente Prisma (si no existe)
await generatePrismaClient();

// 3. Crea tablas (si no existen)
await createTables(); // npx prisma db push

// 4. Inserta datos iniciales (si DB está vacía)
await seedDatabase(); // usuarios demo + categorías

// 5. Verifica que todo esté correcto
await verifySetup();
```

**Ubicación:** `apps/backend/scripts/init-database.js`

### Comandos NPM Agregados

Se agregaron los siguientes scripts al `package.json`:

```json
{
  "scripts": {
    "start:prod:railway": "node scripts/init-database.js && node dist/main",
    "db:init": "node scripts/init-database.js",
    "db:verify": "node verify-db-connection.js",
    "prisma:push": "prisma db push"
  }
}
```

**Uso:**

```bash
# Inicializar base de datos manualmente
npm run db:init

# Verificar conexión y estado de la BD
npm run db:verify

# Iniciar servidor con auto-inicialización (Railway)
npm run start:prod:railway
```

### Configuración Railway: `railway.toml`

El archivo `railway.toml` fue actualizado para usar el nuevo comando:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "pnpm install && pnpm build:backend"

[deploy]
startCommand = "cd apps/backend && npm run start:prod:railway"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

**Lo que hace:**

1. **Build:** Instala dependencias y compila el backend
2. **Deploy:** Ejecuta `start:prod:railway` que:
   - Ejecuta `init-database.js` (crea tablas + seed)
   - Inicia el servidor NestJS

---

## 🧪 Probando Localmente

### Prueba Completa de Inicialización

```bash
cd apps/backend
npm run db:init
```

**Salida esperada:**

```
╔═══════════════════════════════════════════════════════════╗
║   INICIALIZACIÓN AUTOMÁTICA DE BASE DE DATOS - AIQUAA   ║
╚═══════════════════════════════════════════════════════════╝

============================================================
1. Verificando Conexión a PostgreSQL
============================================================
✅ Conexión a PostgreSQL establecida correctamente

============================================================
2. Generando Cliente de Prisma
============================================================
✅ Cliente de Prisma ya está generado

============================================================
3. Creando Tablas en PostgreSQL
============================================================
✅ Creación de tablas en PostgreSQL completado

============================================================
4. Verificando Datos Existentes
============================================================
📊 Usuarios existentes: 2
📊 Categorías existentes: 4

============================================================
5. Poblando Base de Datos (Seed)
============================================================
ℹ️  La base de datos ya contiene datos
   Saltando seed para evitar duplicados

============================================================
6. Verificación Final
============================================================
✅ Total de tablas: 16
✅ Total de usuarios: 2
   - admin@aiquaa.com (ADMIN)
   - demo@aiquaa.com (USER)
✅ Total de categorías: 4

╔═══════════════════════════════════════════════════════════╗
║        ✅ INICIALIZACIÓN COMPLETADA EXITOSAMENTE         ║
╚═══════════════════════════════════════════════════════════╝

⏱️  Tiempo total: 23.35s

🎉 La base de datos está lista para usar!
```

### Verificar Estado de la Base de Datos

```bash
cd apps/backend
npm run db:verify
```

Muestra:
- Estado de conexión
- Lista de usuarios
- Lista de categorías
- Lista de tablas

---

## 🔄 Comportamiento Idempotente

El script es **idempotente**, lo que significa que:

✅ Se puede ejecutar **múltiples veces** sin causar errores
✅ **Detecta tablas existentes** y las reutiliza
✅ **Detecta datos existentes** y no los duplica
✅ **Solo crea lo que falta**

### Ejemplo de Comportamiento

**Primera Ejecución (base de datos vacía):**
```
1. ✅ Conecta a PostgreSQL
2. ✅ Genera cliente Prisma
3. ✅ Crea 16 tablas
4. ✅ Inserta 2 usuarios (admin + demo)
5. ✅ Inserta 4 categorías
6. ✅ Servidor inicia
```

**Segunda Ejecución (base de datos ya configurada):**
```
1. ✅ Conecta a PostgreSQL
2. ✅ Cliente Prisma ya existe (skip)
3. ✅ Tablas ya existen (skip)
4. ℹ️  Datos ya existen (skip seed)
5. ✅ Servidor inicia
```

---

## 📊 Datos Creados Automáticamente

### Usuarios

El seed crea automáticamente dos usuarios:

| Usuario | Email | Password | Rol | Estado |
|---------|-------|----------|-----|--------|
| **Admin** | admin@aiquaa.com | admin123 | ADMIN | Email verificado |
| **Demo** | demo@aiquaa.com | demo123 | USER | Email verificado |

⚠️ **IMPORTANTE:** Cambia o elimina estos usuarios en producción.

### Categorías

| Nombre | Slug | Descripción |
|--------|------|-------------|
| General | general | Discusiones generales sobre QA y testing |
| Automatización | automation | Herramientas y técnicas de automatización |
| Testing Manual | manual-testing | Técnicas y mejores prácticas de testing manual |
| Herramientas | tools | Herramientas y utilidades para QA |

### Tablas

Se crean automáticamente **16 tablas**:

- users
- oauth_accounts
- refresh_tokens
- verification_tokens
- categories
- threads
- thread_tags
- posts
- courses
- lessons
- enrollments
- purchases
- audit_logs
- istqb_exam_results
- _ThreadToThreadTag
- _prisma_migrations

---

## 🚀 Deployment en Railway

### Proceso Automático

Cuando haces deploy en Railway:

1. **Railway ejecuta el build:**
   ```bash
   pnpm install && pnpm build:backend
   ```

2. **Railway inicia el servidor:**
   ```bash
   cd apps/backend && npm run start:prod:railway
   ```

3. **El script de inicio ejecuta:**
   ```bash
   node scripts/init-database.js && node dist/main
   ```

4. **El script de inicialización:**
   - Conecta a PostgreSQL (usando `DATABASE_URL` de Railway)
   - Crea todas las tablas
   - Inserta usuarios y categorías
   - Inicia el servidor NestJS

**Todo es automático. No se requiere intervención manual.**

### Variables de Entorno Necesarias en Railway

Solo necesitas configurar:

```bash
# Railway auto-configura DATABASE_URL
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Otras variables obligatorias
NODE_ENV=production
JWT_SECRET=<tu-secret-seguro>
FRONT_ORIGIN=https://tu-dominio.com
```

---

## 🛠️ Comandos Útiles

### Desarrollo Local

```bash
# Inicializar base de datos (crear tablas + seed)
npm run db:init

# Verificar estado de la base de datos
npm run db:verify

# Recrear datos (ejecuta seed de nuevo)
npm run prisma:seed

# Ver base de datos en UI
npm run prisma:studio

# Solo crear tablas (sin seed)
npm run prisma:push
```

### Troubleshooting

```bash
# Si las tablas no se crean, ejecutar manualmente:
cd apps/backend
npx prisma db push

# Si los usuarios no existen, ejecutar manualmente:
cd apps/backend
npx ts-node prisma/seed.ts

# Resetear base de datos completamente (¡CUIDADO!)
npx prisma db push --force-reset
```

---

## ✅ Ventajas del Sistema

### Antes (Manual)

❌ Tenías que conectarte al servidor y ejecutar:
```bash
ssh servidor
cd backend
npx prisma migrate deploy
npx prisma db seed
```

❌ Si olvidabas ejecutar el seed, la app fallaba
❌ Cada deployment requería pasos manuales
❌ Propenso a errores humanos

### Ahora (Automático)

✅ **Zero-config:** Solo haz git push
✅ **Auto-setup:** Las tablas se crean automáticamente
✅ **Auto-seed:** Los datos iniciales se insertan automáticamente
✅ **Idempotente:** No duplica datos en re-deployments
✅ **Robusto:** Maneja errores y casos edge
✅ **Compatible:** Funciona en Railway, Vercel, Heroku, Docker, etc.

---

## 🔍 Logs de Ejemplo

### Inicio Exitoso

```
[INFO] Iniciando aplicación AIQUAA Backend...
[INFO] Ejecutando inicialización de base de datos...

╔═══════════════════════════════════════════════════════════╗
║   INICIALIZACIÓN AUTOMÁTICA DE BASE DE DATOS - AIQUAA   ║
╚═══════════════════════════════════════════════════════════╝

✅ Conexión a PostgreSQL establecida
✅ Cliente de Prisma generado
✅ Tablas sincronizadas (16 tablas)
✅ Datos verificados (2 usuarios, 4 categorías)

╔═══════════════════════════════════════════════════════════╗
║        ✅ INICIALIZACIÓN COMPLETADA EXITOSAMENTE         ║
╚═══════════════════════════════════════════════════════════╝

[INFO] Iniciando servidor NestJS en puerto 3001...
[INFO] Servidor listo en http://localhost:3001
[INFO] API Docs disponible en http://localhost:3001/api/v1/docs
```

### Re-deployment (datos ya existen)

```
✅ Conexión a PostgreSQL establecida
✅ Cliente de Prisma ya está generado
✅ Tablas ya existen (sincronizadas)
ℹ️  Datos ya existen (saltando seed)
✅ Verificación completada

[INFO] Iniciando servidor NestJS...
```

---

## 🔐 Seguridad

### Datos de Prueba en Producción

⚠️ **IMPORTANTE:** Los usuarios de prueba (`admin@aiquaa.com`, `demo@aiquaa.com`) se crean automáticamente.

**Antes de ir a producción:**

1. **Cambiar contraseñas:**
   ```sql
   UPDATE users SET "passwordHash" = '<nuevo-hash-argon2>'
   WHERE email IN ('admin@aiquaa.com', 'demo@aiquaa.com');
   ```

2. **O eliminarlos completamente:**
   ```sql
   DELETE FROM users
   WHERE email IN ('admin@aiquaa.com', 'demo@aiquaa.com');
   ```

3. **O modificar el seed** para crear usuarios diferentes:
   - Edita `apps/backend/prisma/seed.ts`
   - Cambia emails y contraseñas
   - Redeploy

### Variables de Entorno Sensibles

✅ Nunca commitees `.env` con credenciales reales
✅ Usa variables de entorno en Railway/Vercel
✅ Cambia `JWT_SECRET` a un valor aleatorio seguro

---

## 📚 Documentación Relacionada

- **Guía de Deployment Railway:** `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Schema de Prisma:** `apps/backend/prisma/schema.prisma`
- **Seed de datos:** `apps/backend/prisma/seed.ts`
- **Script de verificación:** `apps/backend/verify-db-connection.js`

---

## 🎯 Próximos Pasos

Ahora que el sistema de auto-inicialización está configurado:

1. ✅ **Deploy en Railway** - Solo haz git push
2. ✅ **Verifica los logs** - Railway mostrará el proceso de inicialización
3. ✅ **Prueba el login** - Con `demo@aiquaa.com` / `demo123`
4. ⚠️ **Cambia credenciales de prueba** - Antes de producción

---

**Última actualización:** Noviembre 30, 2025
**Autor:** Claude Code
**Estado:** ✅ Sistema implementado y probado
