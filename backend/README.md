# 🚀 Backend Aiquaa - Express + Prisma

Backend API para la aplicación Aiquaa con Express.js y Prisma ORM.

## 📋 Requisitos

- Node.js >= 16.18.0
- PostgreSQL
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar base de datos:**
   - Crear una base de datos PostgreSQL llamada `aiquaa_db`
   - Actualizar la URL de conexión en `.env`:
   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/aiquaa_db"
   ```

3. **Generar cliente Prisma:**
```bash
npm run db:generate
```

4. **Ejecutar migraciones:**
```bash
npm run db:migrate
```

## 🚀 Desarrollo

**Ejecutar en modo desarrollo:**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## 📦 Producción

**Compilar TypeScript:**
```bash
npm run build
```

**Ejecutar en producción:**
```bash
npm start
```

## 🗄️ Base de Datos

**Abrir Prisma Studio:**
```bash
npm run db:studio
```

## 📡 Endpoints

### Usuarios
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios` - Obtener todos los usuarios

### Feedback
- `POST /api/feedback` - Guardar feedback
- `GET /api/feedback` - Obtener todos los feedbacks
- `GET /api/feedback/metrics` - Obtener métricas de feedback

### Health Check
- `GET /` - Verificar estado del servidor

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecutar en desarrollo con nodemon
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar en producción
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:studio` - Abrir Prisma Studio

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   └── index.ts          # Servidor principal
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
├── .env                  # Variables de entorno
├── package.json          # Dependencias y scripts
└── tsconfig.json         # Configuración TypeScript
``` 