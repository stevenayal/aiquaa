# Configuración Completa de Supabase para Aiquaa

## 📋 Resumen

Esta guía te ayudará a configurar completamente Supabase en tu proyecto Aiquaa, incluyendo:
- Variables de entorno
- Configuración del frontend (Vite + React)
- Configuración del backend (Express + Prisma)
- Migración de SQLite a PostgreSQL
- Servicios y rutas de ejemplo

## 🚀 Pasos de Configuración

### 1. Variables de Entorno

#### Frontend (`.env.local`)
Copia el archivo `env.local.example` a `.env.local` en la raíz del proyecto:

```bash
cp env.local.example .env.local
```

#### Backend (`.env`)
Copia el archivo `backend/env.example` a `backend/.env`:

```bash
cp backend/env.example backend/.env
```

### 2. Configurar Supabase

#### 2.1 Crear las tablas en Supabase
1. Ve al [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y ejecuta el contenido de `supabase-schema.sql`

#### 2.2 Verificar las variables de entorno
Asegúrate de que las siguientes variables estén configuradas correctamente:

**Frontend:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### 3. Migrar de SQLite a PostgreSQL

#### 3.1 Actualizar Prisma
El esquema de Prisma ya está configurado para usar PostgreSQL. Ejecuta:

```bash
cd backend
npm run db:generate
npm run db:migrate
```

#### 3.2 Verificar la conexión
```bash
cd backend
npm run db:studio
```

### 4. Instalar Dependencias

#### Frontend
```bash
npm install @supabase/supabase-js
```

#### Backend
```bash
cd backend
npm install @supabase/supabase-js
```

## 📁 Estructura de Archivos

```
aiquaa/
├── .env.local                    # Variables de entorno del frontend
├── env.local.example            # Ejemplo de variables del frontend
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Configuración de Supabase (frontend)
│   └── services/
│       └── supabaseService.ts   # Servicios usando Supabase
├── backend/
│   ├── .env                     # Variables de entorno del backend
│   ├── env.example             # Ejemplo de variables del backend
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.ts      # Configuración de Supabase (backend)
│   │   └── routes/
│   │       └── supabase.ts      # Rutas de ejemplo
│   └── prisma/
│       └── schema.prisma        # Esquema actualizado para PostgreSQL
└── supabase-schema.sql          # Script SQL para crear tablas
```

## 🔧 Uso de Supabase

### Frontend

#### Importar el cliente
```typescript
import { supabase } from '../lib/supabase'
```

#### Ejemplo de uso en componentes
```typescript
import { supabaseService } from '../services/supabaseService'

// Enviar feedback
const handleSubmit = async (data) => {
  try {
    await supabaseService.submitFeedback(data)
    console.log('Feedback enviado exitosamente')
  } catch (error) {
    console.error('Error:', error)
  }
}

// Obtener feedbacks
const loadFeedbacks = async () => {
  try {
    const feedbacks = await supabaseService.getFeedbacks()
    console.log('Feedbacks:', feedbacks)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Backend

#### Importar el cliente
```typescript
import { supabase } from '../lib/supabase'
```

#### Ejemplo de uso en rutas
```typescript
import express from 'express'
import { supabase } from '../lib/supabase'

const router = express.Router()

router.get('/feedbacks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .order('creado_en', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

## 🔒 Seguridad

### Variables de Entorno
- **NUNCA** expongas `SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_JWT_SECRET` al frontend
- Solo usa `VITE_SUPABASE_ANON_KEY` en el frontend
- Las claves de servicio solo deben estar en el backend

### Row Level Security (RLS)
Las políticas de seguridad están configuradas en `supabase-schema.sql`:
- Lectura pública para feedbacks y comentarios
- Inserción pública para feedbacks y comentarios
- Actualización restringida para usuarios

## 🧪 Testing

### Probar la conexión del frontend
```typescript
import { supabase } from '../lib/supabase'

// Test básico
const testConnection = async () => {
  const { data, error } = await supabase
    .from('feedbacks')
    .select('count')
    .limit(1)
  
  if (error) {
    console.error('Error de conexión:', error)
  } else {
    console.log('Conexión exitosa')
  }
}
```

### Probar la conexión del backend
```bash
cd backend
npm run dev
```

Luego visita: `http://localhost:3001/api/supabase/feedbacks`

## 📊 Monitoreo

### Supabase Dashboard
- Ve a [Supabase Dashboard](https://supabase.com/dashboard)
- Selecciona tu proyecto
- Usa **Table Editor** para ver los datos
- Usa **Logs** para monitorear las consultas

### Métricas importantes
- Número de feedbacks por día
- Temas más populares
- Herramientas más solicitadas
- Participación de la comunidad

## 🚨 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que `.env.local` existe en el frontend
- Verifica que `backend/.env` existe en el backend
- Asegúrate de que las variables estén correctamente nombradas

### Error: "Invalid API key"
- Verifica que las claves de Supabase sean correctas
- Asegúrate de usar la clave anónima en el frontend
- Asegúrate de usar la clave de servicio en el backend

### Error de conexión a PostgreSQL
- Verifica que `POSTGRES_PRISMA_URL` esté configurado correctamente
- Asegúrate de que la base de datos esté activa en Supabase
- Verifica que las credenciales sean correctas

### Error de migración de Prisma
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Prisma con PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

## 🤝 Contribución

Si encuentras algún problema o tienes sugerencias:
1. Revisa los logs de Supabase
2. Verifica la configuración de variables de entorno
3. Consulta la documentación oficial
4. Abre un issue en el repositorio

---

**¡Listo! Tu proyecto Aiquaa ahora está completamente integrado con Supabase.** 🎉 