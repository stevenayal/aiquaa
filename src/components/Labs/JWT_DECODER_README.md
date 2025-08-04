# 🔐 Decodificador JWT - AIQUAA Labs

## Descripción

El **Decodificador JWT** es una herramienta visual que permite decodificar y analizar tokens JWT (JSON Web Tokens) de forma segura y clara. Ideal para desarrolladores, testers y administradores que necesitan inspeccionar el contenido de tokens JWT.

## Características

### ✅ Funcionalidades Principales

- **Decodificación Visual**: Divide automáticamente el token en sus 3 componentes (Header, Payload, Signature)
- **Análisis de Expiración**: Verifica automáticamente si el token ha expirado basándose en el campo `exp`
- **Formato JSON**: Muestra el header y payload decodificados en formato JSON legible
- **Claims Destacados**: Resalta información importante como subject, emisión, expiración y emisor
- **Copia al Portapapeles**: Botón para copiar el payload completo al portapapeles

### 🔧 Validaciones Implementadas

- **Estructura del Token**: Verifica que el JWT tenga exactamente 3 partes separadas por puntos
- **Decodificación Base64**: Valida que las partes header y payload sean Base64 URL-safe válidas
- **Parsing JSON**: Verifica que el contenido decodificado sea JSON válido
- **Manejo de Errores**: Mensajes claros y específicos para cada tipo de error

### 🎨 Interfaz de Usuario

- **Diseño Responsivo**: Adaptado para diferentes tamaños de pantalla
- **Feedback Visual**: Indicadores de estado (válido/expirado) con colores apropiados
- **Ejemplos Integrados**: Tokens de ejemplo para probar la funcionalidad
- **Navegación Intuitiva**: Breadcrumbs y navegación consistente con el resto de Labs

## Uso

### 1. Ingreso del Token
- Pega tu token JWT en el área de texto
- El token debe tener el formato: `header.payload.signature`

### 2. Decodificación
- Haz clic en "Decodificar JWT"
- La herramienta procesará automáticamente el token

### 3. Análisis de Resultados
- **Estado del Token**: Se muestra si está vigente o expirado
- **Header**: Algoritmo de firma y tipo de token
- **Payload**: Claims del usuario y metadatos
- **Signature**: Firma digital (solo visualización)

### 4. Funciones Adicionales
- **Copiar Payload**: Botón para copiar el payload al portapapeles
- **Ejemplos**: Tokens predefinidos para testing
- **Limpiar**: Botón para resetear el formulario

## Ejemplos Incluidos

### Token Válido
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODgwMDAsImlzcyI6ImFpcXVhYS5jb20iLCJhdWQiOiJhcGkuYWlxdWFhLmNvbSIsInJvbGUiOiJ1c2VyIn0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
```

### Token Expirado
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsImlzcyI6ImFpcXVhYS5jb20iLCJhdWQiOiJhcGkuYWlxdWFhLmNvbSIsInJvbGUiOiJhZG1pbiJ9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
```

## Claims Comunes Analizados

| Claim | Descripción | Ejemplo |
|-------|-------------|---------|
| `sub` | Subject (identificador del usuario) | `"user_123"` |
| `name` | Nombre del usuario | `"Ana García"` |
| `email` | Email del usuario | `"ana@example.com"` |
| `iat` | Issued At (fecha de emisión) | `1516239022` |
| `exp` | Expiration (fecha de expiración) | `1735688000` |
| `iss` | Issuer (emisor del token) | `"aiquaa.com"` |
| `aud` | Audience (audiencia) | `"api.aiquaa.com"` |
| `role` | Rol del usuario | `"moderador"` |

## Seguridad

### ⚠️ Limitaciones de Seguridad

- **No Validación de Firma**: La herramienta NO valida la firma del token por razones de seguridad
- **Solo Decodificación**: Se limita a decodificar y mostrar el contenido, sin verificar autenticidad
- **Uso Educativo**: Ideal para desarrollo, testing y debugging, no para validación en producción

### 🔒 Mejores Prácticas

- **No compartir tokens reales**: Usa solo tokens de prueba o desarrollo
- **Verificar en el servidor**: La validación real debe hacerse en el backend
- **Manejo seguro**: Los tokens contienen información sensible, manéjalos con cuidado

## Tecnologías Utilizadas

- **React 18**: Framework principal
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos y diseño
- **React Router**: Navegación
- **React Helmet**: SEO y metadatos

## Estructura del Código

```
src/components/Labs/
├── JwtDecoder.tsx              # Componente principal
├── example-jwt-tokens.json     # Tokens de ejemplo
└── JWT_DECODER_README.md       # Esta documentación
```

## Contribución

Para contribuir al desarrollo de esta herramienta:

1. Fork del repositorio
2. Crear una rama para tu feature
3. Implementar cambios
4. Probar con diferentes tipos de tokens
5. Crear Pull Request

## Licencia

Este proyecto es parte de AIQUAA Labs y está bajo la misma licencia que el proyecto principal.

---

**Desarrollado con ❤️ para la comunidad de testers y desarrolladores** 