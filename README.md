# AIQUAA Monorepo

Plataforma de inteligencia artificial y desarrollo con herramientas, laboratorios y comunidad para QA en Paraguay.

## 🏗️ Estructura del Proyecto

```
aiquaa/
├── apps/
│   ├── frontend/          # Next.js 15 App Router
│   └── backend/           # NestJS API
├── packages/
│   └── shared/            # Tipos y utilidades compartidas
├── docker-compose.yml     # PostgreSQL
├── Makefile              # Comandos útiles
└── package.json          # Workspace root
```

## 🚀 Requisitos

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 16

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd aiquaa
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar archivos de ejemplo
   cp env.example .env
   cp apps/frontend/env.local.example apps/frontend/.env.local
   ```

4. **Levantar base de datos**
   ```bash
   make db-up
   ```

5. **Ejecutar migraciones y seed**
   ```bash
   make db-seed
   ```

## 🎯 Comandos Principales

### Desarrollo
```bash
# Iniciar frontend y backend
make dev

# Solo frontend (puerto 3001)
make dev-front

# Solo backend (puerto 3000)
make dev-back
```

### Base de Datos
```bash
# Levantar PostgreSQL
make db-up

# Detener PostgreSQL
make db-down

# Migraciones y seed
make db-seed
```

### Build
```bash
# Build de todos los paquetes
make build

# Limpiar artifacts
make clean
```

## 📁 Apps

### Frontend (Next.js 15)
- **Puerto**: 3001
- **URL**: http://localhost:3001
- **Tecnologías**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Características**: App Router, SSR, API Routes

### Backend (NestJS)
- **Puerto**: 3000
- **URL**: http://localhost:3000/api/v1
- **Documentación**: http://localhost:3000/api/v1/docs
- **Tecnologías**: NestJS, TypeScript, Prisma, PostgreSQL
- **Características**: OpenAPI, JWT Auth, CORS

## 📦 Packages

### Shared
- Tipos TypeScript generados desde OpenAPI
- Utilidades compartidas entre frontend y backend
- Generación automática de tipos: `pnpm --filter @aiquaa/shared gen:types`

## 🔧 Configuración

### Variables de Entorno

#### Root (.env)
```bash
NODE_ENV=development
API_URL=http://localhost:3000/api/v1
DATABASE_URL=postgres://postgres:postgres@localhost:5432/aiquaa
JWT_SECRET=change-me
FRONTEND_PORT=3001
BACKEND_PORT=3000
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## 🗄️ Base de Datos

### PostgreSQL
- **Versión**: 16-alpine
- **Puerto**: 5432
- **Base de datos**: aiquaa
- **Usuario**: postgres
- **Contraseña**: postgres

### Migraciones
```bash
# Generar migración
cd apps/backend && pnpm prisma:migrate dev

# Aplicar migraciones
cd apps/backend && pnpm prisma:migrate deploy

# Ver base de datos
cd apps/backend && pnpm prisma studio
```

## 🔄 Workflow de Desarrollo

1. **Generar tipos OpenAPI**
   ```bash
   # Desde el backend
   pnpm --filter @aiquaa/backend openapi:print
   
   # Generar tipos TypeScript
   pnpm --filter @aiquaa/shared gen:types
   ```

2. **Desarrollo**
   ```bash
   # Terminal 1: Backend
   make dev-back
   
   # Terminal 2: Frontend
   make dev-front
   ```

3. **Testing**
   ```bash
   # Lint
   pnpm lint
   
   # Build
   pnpm build
   ```

## 🚀 Despliegue

### Frontend (Vercel)
- Configurado para Next.js 15
- Variables de entorno: `NEXT_PUBLIC_API_URL`

### Backend (Railway/Heroku)
- Configurado para NestJS
- Variables de entorno: `DATABASE_URL`, `JWT_SECRET`

## 📚 Documentación

- [API Documentation](http://localhost:3000/api/v1/docs) - Swagger UI
- [Prisma Studio](http://localhost:5555) - Gestor de base de datos
- [Next.js Docs](https://nextjs.org/docs) - Documentación de Next.js
- [NestJS Docs](https://docs.nestjs.com/) - Documentación de NestJS

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Steven Ayala** - QA Lead & Automation Engineer
- **AIQUAA Community** - Comunidad de QA en Paraguay

---

**AIQUAA**: Saber es Calidad. Inspirados por el conocimiento, impulsados por la comunidad.
