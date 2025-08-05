# 🏗️ Backend Express con Prisma - Setup Completo

## 📋 Resumen del Proyecto

Se ha creado un backend completo con Express.js y Prisma ORM para la aplicación Aiquaa, reemplazando el almacenamiento local por una base de datos PostgreSQL.

### 🎯 Características Implementadas

- ✅ **API REST completa** con Express.js
- ✅ **Base de datos PostgreSQL** con Prisma ORM
- ✅ **Modelos de datos**: Usuario y Feedback
- ✅ **Endpoints CRUD** para usuarios y feedback
- ✅ **Métricas en tiempo real** calculadas desde la BD
- ✅ **Integración frontend** con fallback a localStorage
- ✅ **TypeScript** para type safety
- ✅ **CORS habilitado** para desarrollo
- ✅ **Scripts de desarrollo** con nodemon

## 🗄️ Estructura de Base de Datos

### Modelo Usuario
```sql
- id (Int, PK, autoincrement)
- nombre (String, opcional)
- email (String, único)
- rol (String, default: "comunidad")
- creadoEn (DateTime, default: now())
- feedbacks (Relación 1:N con Feedback)
```

### Modelo Feedback
```sql
- id (Int, PK, autoincrement)
- usuarioId (Int, FK opcional)
- temasQA (String[])
- herramientas (String[])
- participacion (String, opcional)
- formato (String, opcional)
- sugerencias (String, opcional)
- sessionId (String, opcional)
- userAgent (String, opcional)
- ip (String, opcional)
- pais (String, opcional)
- otrosTemas (String, opcional)
- otrasHerramientas (String, opcional)
- creadoEn (DateTime, default: now())
```

## 🚀 Endpoints API

### Usuarios
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios` - Obtener todos los usuarios

### Feedback
- `POST /api/feedback` - Guardar feedback
- `GET /api/feedback` - Obtener todos los feedbacks
- `GET /api/feedback/metrics` - Obtener métricas calculadas

### Health Check
- `GET /` - Verificar estado del servidor

## 🛠️ Instalación y Configuración

### 1. Requisitos Previos
```bash
# Node.js >= 16.18.0
node --version

# PostgreSQL instalado y corriendo
# Crear base de datos: aiquaa_db
```

### 2. Configurar Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env con tu configuración de PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/aiquaa_db"

# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate
```

### 3. Ejecutar Backend
```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm run build
npm start
```

### 4. Probar API
```bash
# Ejecutar tests
node test-api.js
```

## 🔄 Integración Frontend

### Cambios Realizados

1. **FeedbackService actualizado** (`src/services/feedbackService.ts`):
   - Conexión a API backend con fallback a localStorage
   - Métodos async para obtener datos y métricas
   - Manejo de errores con fallback

2. **FeedbackMetrics actualizado** (`src/components/FeedbackMetrics.tsx`):
   - Carga de métricas desde API
   - Fallback a cálculo local si API falla

### Configuración Frontend

El frontend se conecta automáticamente al backend en desarrollo:
- **Desarrollo**: `http://localhost:3001`
- **Producción**: Configurar `API_BASE_URL` en `feedbackService.ts`

## 📊 Scripts Disponibles

### Backend
```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm start           # Ejecutar en producción
npm run db:generate # Generar cliente Prisma
npm run db:migrate  # Ejecutar migraciones
npm run db:studio   # Abrir Prisma Studio
```

### Testing
```bash
node test-api.js    # Probar endpoints API
```

## 🔧 Configuración de Base de Datos

### PostgreSQL Local
```sql
-- Crear base de datos
CREATE DATABASE aiquaa_db;

-- Crear usuario (opcional)
CREATE USER aiquaa_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE aiquaa_db TO aiquaa_user;
```

### Variables de Entorno (.env)
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/aiquaa_db"
PORT=3001
```

## 🚀 Despliegue

### Opciones de Despliegue

1. **Vercel** (Recomendado para frontend)
2. **Railway** (Backend + PostgreSQL)
3. **Heroku** (Backend + PostgreSQL)
4. **DigitalOcean** (VPS completo)

### Configuración de Producción

1. **Base de datos**: Usar PostgreSQL en la nube
2. **Variables de entorno**: Configurar en plataforma de despliegue
3. **CORS**: Configurar dominios permitidos
4. **SSL**: Habilitar HTTPS

## 🔍 Monitoreo y Debugging

### Prisma Studio
```bash
npm run db:studio
```
Abre interfaz web para explorar y editar datos.

### Logs
```bash
# Ver logs del servidor
npm run dev

# Logs de Prisma
DEBUG=prisma:* npm run dev
```

## 🧪 Testing

### API Testing
```bash
# Ejecutar tests automáticos
node test-api.js

# Probar endpoints manualmente
curl http://localhost:3001/
curl http://localhost:3001/api/feedback
```

### Frontend Testing
El frontend incluye fallback automático si el backend no está disponible.

## 📈 Métricas y Analytics

### Datos Recopilados
- Total de respuestas
- Temas QA más populares
- Herramientas más utilizadas
- Tipos de participación
- Formatos preferidos
- Sugerencias de usuarios
- Frecuencia de palabras

### Exportación
- JSON completo de datos
- Métricas calculadas
- Análisis de tendencias

## 🔒 Seguridad

### Implementado
- ✅ Validación de datos de entrada
- ✅ Manejo de errores
- ✅ CORS configurado
- ✅ Sanitización de datos

### Recomendaciones
- 🔄 Implementar autenticación JWT
- 🔄 Rate limiting
- 🔄 Validación más estricta
- 🔄 Logging de seguridad

## 🚀 Próximos Pasos

1. **Autenticación**: Implementar login/registro
2. **Dashboard Admin**: Panel de administración
3. **Notificaciones**: Email/SMS automáticos
4. **Analytics Avanzado**: Gráficos y reportes
5. **API Rate Limiting**: Protección contra spam
6. **Backup Automático**: Respaldo de datos
7. **Monitoreo**: Alertas y métricas de rendimiento

## 📞 Soporte

Para problemas o consultas:
1. Revisar logs del servidor
2. Verificar conexión a base de datos
3. Probar endpoints con `test-api.js`
4. Consultar documentación de Prisma

---

**¡Backend listo para producción! 🎉** 