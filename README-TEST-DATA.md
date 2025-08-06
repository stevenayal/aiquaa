# 📝 Datos de Prueba para Supabase - Aiquaa

Este directorio contiene scripts para insertar datos de prueba en tu base de datos de Supabase para verificar que los comentarios y feedback se muestren correctamente en tu aplicación.

## 📁 Archivos Incluidos

- `test-inserts.sql` - Script SQL completo con inserts y consultas de verificación
- `supabase-dashboard-inserts.sql` - Versión simplificada para ejecutar en el dashboard de Supabase
- `insert-test-data.ps1` - Script de PowerShell para automatizar la inserción
- `README-TEST-DATA.md` - Este archivo con instrucciones

## 🚀 Cómo Usar los Inserts

### Opción 1: Dashboard de Supabase (Recomendado)

1. **Accede al Dashboard de Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Inicia sesión en tu cuenta
   - Selecciona tu proyecto

2. **Navega al SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Crea un nuevo query

3. **Ejecuta el Script**
   - Copia el contenido de `supabase-dashboard-inserts.sql`
   - Pégalo en el editor SQL
   - Haz clic en "Run" para ejecutar

4. **Verifica los Resultados**
   - Ve a "Table Editor" en el menú lateral
   - Selecciona la tabla "Comment" o "Feedback"
   - Verifica que los registros aparezcan

### Opción 2: Script de PowerShell

1. **Preparación**
   - Asegúrate de tener configurado el archivo `.env` en el directorio `backend/`
   - Verifica que tienes las variables de entorno de Supabase

2. **Ejecutar el Script**
   ```powershell
   .\insert-test-data.ps1
   ```

3. **Verificar Resultados**
   - El script mostrará un resumen de la ejecución
   - Revisa los mensajes de éxito/error

### Opción 3: Manual (Línea por Línea)

Si prefieres ejecutar los inserts uno por uno:

1. **Inserts de Comentarios**
   ```sql
   INSERT INTO "Comment" (name, message, isAnonymous, userAgent, ip, "createdAt", "updatedAt") VALUES
   ('María González', '¡Excelente iniciativa! Me encantaría participar en los talleres de automatización.', false, 'Mozilla/5.0...', '192.168.1.100', NOW(), NOW());
   ```

2. **Inserts de Feedback**
   ```sql
   INSERT INTO "Feedback" ("temasQA", "herramientas", "participacion", "formato", "sugerencias", "sessionId", "userAgent", "ip", "pais", "creadoEn") VALUES
   ('["automatizacion", "api"]', '["cypress", "postman"]', 'taller', 'videos', 'Me gustaría ver más contenido...', 'session_001', 'Mozilla/5.0...', '192.168.1.110', 'Paraguay', NOW());
   ```

## 📊 Datos de Prueba Incluidos

### Comentarios (10 registros)
- **Nombres variados**: María González, Carlos López, Ana Silva, etc.
- **Mensajes realistas**: Comentarios sobre automatización, APIs, seguridad, etc.
- **Anonimato**: Incluye un comentario anónimo para probar esa funcionalidad
- **User Agents**: Simula diferentes navegadores y dispositivos
- **IPs**: Direcciones IP simuladas para pruebas

### Feedback (10 registros)
- **Temas QA**: Automatización, manual, API, performance, seguridad, Paraguay
- **Herramientas**: Cypress, Postman, Selenium, Playwright, JMeter, GitHub Actions
- **Participación**: Talleres, charlas, Discord, artículos, red
- **Formatos**: Videos, blog, infografías, plantillas
- **Sugerencias**: Comentarios realistas sobre contenido deseado

## 🔍 Consultas de Verificación

Después de ejecutar los inserts, puedes usar estas consultas para verificar:

### Ver Comentarios
```sql
SELECT id, name, message, isAnonymous, "createdAt"
FROM "Comment" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### Ver Feedback
```sql
SELECT id, "temasQA", "herramientas", "participacion", "formato", "sugerencias", "creadoEn"
FROM "Feedback" 
ORDER BY "creadoEn" DESC 
LIMIT 10;
```

### Contar Registros
```sql
SELECT 'Comments' as table_name, COUNT(*) as total_records FROM "Comment"
UNION ALL
SELECT 'Feedback' as table_name, COUNT(*) as total_records FROM "Feedback";
```

## 🧪 Probar en la Aplicación

Una vez insertados los datos:

1. **Inicia tu aplicación**
   ```bash
   npm run dev
   ```

2. **Navega a las páginas de comentarios y feedback**
   - Ve a `/community` para ver comentarios
   - Ve a `/feedback` para ver el formulario
   - Ve a `/feedback-admin` para ver métricas (si tienes acceso)

3. **Verifica que los datos aparezcan**
   - Los comentarios deberían mostrarse en la página de comunidad
   - Las métricas de feedback deberían actualizarse
   - Los formularios deberían funcionar correctamente

## 🛠️ Solución de Problemas

### Error: "relation does not exist"
- Verifica que las tablas "Comment" y "Feedback" existan en tu base de datos
- Ejecuta las migraciones de Prisma si es necesario

### Error: "permission denied"
- Verifica que tu usuario tenga permisos de escritura en las tablas
- Revisa las políticas RLS (Row Level Security) en Supabase

### Los datos no aparecen en la aplicación
- Verifica que la URL de la API esté configurada correctamente
- Revisa la consola del navegador para errores de red
- Verifica que las rutas de la API estén funcionando

### Error en el script de PowerShell
- Verifica que tienes psql instalado o curl disponible
- Revisa que las variables de entorno estén configuradas
- Ejecuta el script como administrador si es necesario

## 📝 Notas Importantes

1. **Arrays JSON**: Los campos `temasQA` y `herramientas` se almacenan como strings JSON
2. **Fechas**: Se usan `NOW()` para fechas actuales
3. **Session IDs**: Cada feedback tiene un sessionId único
4. **User Agents**: Simulados para pruebas realistas
5. **País**: Todos los registros tienen "Paraguay" como país

## 🧹 Limpiar Datos de Prueba

Si necesitas limpiar los datos de prueba:

```sql
-- LIMPIAR COMENTARIOS DE PRUEBA
DELETE FROM "Comment" WHERE name IN ('María González', 'Carlos López', 'Ana Silva', 'Tester Anónimo', 'Roberto Fernández', 'Laura Martínez', 'Juan Pérez', 'Sofia Rodríguez', 'Miguel Torres', 'Carmen Vega');

-- LIMPIAR FEEDBACK DE PRUEBA
DELETE FROM "Feedback" WHERE "sessionId" LIKE 'session_%';
```

## 🎯 Próximos Pasos

1. Ejecuta los inserts de prueba
2. Verifica que los datos aparezcan en Supabase
3. Prueba la funcionalidad en tu aplicación
4. Ajusta los datos según sea necesario
5. Documenta cualquier problema encontrado

¡Con estos datos de prueba podrás verificar que tu sistema de comentarios y feedback funciona correctamente! 🚀 