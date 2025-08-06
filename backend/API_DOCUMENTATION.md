# 📚 Documentación de la API de Aiquaa

## 🚀 Swagger/OpenAPI Documentation

La API de Aiquaa incluye documentación interactiva generada con Swagger/OpenAPI 3.0.

### 📖 Acceso a la Documentación

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva en:

```
http://localhost:3001/api-docs
```

### 🔧 Endpoints Documentados

#### Comentarios de la Comunidad

##### `POST /api/comments`
- **Descripción**: Crear un nuevo comentario en la comunidad
- **Body requerido**: 
  - `message` (string, obligatorio): Contenido del mensaje
  - `name` (string, opcional): Nombre del autor
  - `isAnonymous` (boolean, opcional): Permite publicar sin nombre
- **Respuesta**: 201 Created con el comentario creado

##### `GET /api/comments`
- **Descripción**: Obtener los últimos 50 comentarios
- **Respuesta**: 200 OK con array de comentarios ordenados por fecha

#### Sistema

##### `GET /`
- **Descripción**: Health check para verificar que la API está funcionando
- **Respuesta**: 200 OK con mensaje de confirmación

### 🛠️ Características de la Documentación

- **Interactiva**: Puedes probar los endpoints directamente desde la interfaz
- **Ejemplos**: Incluye ejemplos de request y response para cada endpoint
- **Esquemas**: Define claramente la estructura de datos esperada
- **Códigos de Error**: Documenta todos los posibles códigos de respuesta

### 📋 Ejemplos de Uso

#### Crear un comentario con nombre
```bash
curl -X POST http://localhost:3001/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "message": "¡Excelente iniciativa!",
    "isAnonymous": false
  }'
```

#### Crear un comentario anónimo
```bash
curl -X POST http://localhost:3001/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Muy buena plataforma",
    "isAnonymous": true
  }'
```

#### Obtener comentarios
```bash
curl -X GET http://localhost:3001/api/comments
```

### 🔍 Validaciones

- **message**: No puede estar vacío
- **isAnonymous**: Si es true, el nombre se establece como "Anónimo"
- **name**: Opcional, se establece como "Usuario" si no se proporciona

### 🚀 Iniciar el Servidor

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3001` y la documentación estará disponible en `http://localhost:3001/api-docs`. 