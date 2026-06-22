# ¿Qué es API Testing?

**API Testing** es una disciplina de testing que valida que las **Application Programming Interfaces (APIs)** funcionen correctamente, de forma segura y eficiente. Según **Postman (2024)**, el **83% de los desarrolladores** usan APIs como parte de su trabajo diario.

## Definición

**API Testing** es el proceso de probar APIs directamente en el nivel de integración. Valida respuestas, rendimiento, seguridad y comportamiento bajo diferentes condiciones.

## Tipos de APIs

| Tipo          | Protocolo  | Ejemplo                  | Uso Principal          |
| ------------- | ---------- | ------------------------ | ---------------------- |
| **REST**      | HTTP       | APIs RESTful             | Web y móviles          |
| **SOAP**      | HTTP/HTTPS | APIs empresariales       | Sistemas legacy        |
| **GraphQL**   | HTTP       | APIs flexibles           | Aplicaciones complejas |
| **gRPC**      | HTTP/2     | APIs de alto rendimiento | Microservicios         |
| **WebSocket** | WS/WSS     | APIs en tiempo real      | Chat, live updates     |

## Métodos HTTP y sus Usos

| Método      | Uso                 | Ejemplo                      |
| ----------- | ------------------- | ---------------------------- |
| **GET**     | Leer datos          | Obtener lista de usuarios    |
| **POST**    | Crear datos         | Crear nuevo usuario          |
| **PUT**     | Actualizar completo | Actualizar usuario existente |
| **PATCH**   | Actualizar parcial  | Modificar campo específico   |
| **DELETE**  | Eliminar datos      | Borrar usuario               |
| **HEAD**    | Obtener headers     | Verificar existencia         |
| **OPTIONS** | Obtener opciones    | CORS preflight               |

## Tipos de Pruebas API

### 1. Pruebas Funcionales

- **Validación de respuesta** - Status codes, headers, body
- **Validación de datos** - Tipos, formato, valores
- **Validación de esquema** - Estructura JSON/XML
- **Pruebas de negocio** - Reglas de negocio

### 2. Pruebas de Seguridad

- **Autenticación** - Validar tokens, credenciales
- **Autorización** - Verificar permisos
- **Inyección SQL** - Prevenir ataques
- **XSS** - Cross-Site Scripting
- **Rate limiting** - Límites de peticiones

### 3. Pruebas de Rendimiento

- **Response time** - Tiempo de respuesta
- **Throughput** - Peticiones por segundo
- **Latency** - Tiempo de red
- **Carga** - Comportamiento bajo estrés

### 4. Pruebas de Contrato

- **Validación de esquema** - Estructura de respuesta
- **Compatibilidad** - Versiones de API
- **Documentación** - Contrato implícito

## Código de Estado HTTP

### Códigos de Éxito (2xx)

| Código  | Significado     | Uso                 |
| ------- | --------------- | ------------------- |
| **200** | OK              | Petición exitosa    |
| **201** | Created         | Recurso creado      |
| **204** | No Content      | Eliminación exitosa |
| **206** | Partial Content | Respuesta parcial   |

### Códigos de Redirección (3xx)

| Código  | Significado       | Uso          |
| ------- | ----------------- | ------------ |
| **301** | Moved Permanently | URL cambiada |
| **304** | Not Modified      | Usar caché   |

### Códigos de Error Cliente (4xx)

| Código  | Significado          | Uso                   |
| ------- | -------------------- | --------------------- |
| **400** | Bad Request          | Petición mal formada  |
| **401** | Unauthorized         | No autenticado        |
| **403** | Forbidden            | No autorizado         |
| **404** | Not Found            | Recurso no existe     |
| **405** | Method Not Allowed   | Método no permitido   |
| **409** | Conflict             | Conflicto de recursos |
| **422** | Unprocessable Entity | Error de validación   |
| **429** | Too Many Requests    | Rate limit excedido   |

### Códigos de Error Servidor (5xx)

| Código  | Significado           | Uso                    |
| ------- | --------------------- | ---------------------- |
| **500** | Internal Server Error | Error genérico         |
| **502** | Bad Gateway           | Gateway inválido       |
| **503** | Service Unavailable   | Servicio no disponible |

## Herramientas Populares

### Postman

- **Tipo:** GUI/CLI
- **Ventajas:** Fácil de usar, коллекiones, automatización
- **Uso:** Desarrollo y testing
- **Nivel:** Básico-Avanzado

### Newman (CLI de Postman)

- **Tipo:** CLI
- **Ventajas:** CI/CD friendly, automatización
- **Uso:** Pipelines de integración
- **Nivel:** Intermedio

### SoapUI

- **Tipo:** GUI
- **Ventajas:** Soporte SOAP/REST, load testing
- **Uso:** APIs empresariales
- **Nivel:** Intermedio-Avanzado

### Insomnia

- **Tipo:** GUI
- **Ventajas:** Moderno, GraphQL friendly
- **Uso:** Desarrollo y testing
- **Nivel:** Básico-Intermedio

### curl

- **Tipo:** CLI
- **Ventajas:** Universal, potente, scripting
- **Uso:** Pruebas rápidas, automatización
- **Nivel:** Intermedio-Avanzado

## Proceso de API Testing

### 1. Comprensión de la API

- Revisar documentación (Swagger/OpenAPI)
- Entender endpoints y parámetros
- Identificar autenticación
- Conocer rate limits

### 2. Diseño de Pruebas

- Definir casos de prueba
- Crear datos de prueba
- Establecer criterios de aceptación
- Preparar ambiente

### 3. Ejecución

- Ejecutar pruebas manuales/automatizadas
- Registrar resultados
- Identificar defectos
- Documentar issues

### 4. Reporte

- Generar reportes
- Clasificar defectos
- Priorizar correcciones
- Comunicar resultados

## Mejores Prácticas

1. **Automatizar pruebas repetitivas** - Usar herramientas CI/CD
2. **Usar datos de prueba aislados** - Evitar efectos colaterales
3. **Validar esquemas** - Asegurar estructura de respuesta
4. **Probar negativos** - Validar manejo de errores
5. **Monitorear rendimiento** - Medir tiempos de respuesta
6. **Probar seguridad** - Validar autenticación y autorización
7. **Documentar hallazgos** - Mantener registro de pruebas

## Ejemplo de Prueba API (Python)

```python
import requests

def test_get_users():
    """Prueba para obtener lista de usuarios"""
    response = requests.get('https://api.example.com/users')

    # Validar status code
    assert response.status_code == 200

    # Validar headers
    assert 'application/json' in response.headers['Content-Type']

    # Validar body
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    # Validar estructura de cada usuario
    for user in data:
        assert 'id' in user
        assert 'name' in user
        assert 'email' in user

def test_create_user():
    """Prueba para crear usuario"""
    new_user = {
        'name': 'Juan Pérez',
        'email': 'juan@example.com'
    }

    response = requests.post(
        'https://api.example.com/users',
        json=new_user
    )

    assert response.status_code == 201
    created = response.json()
    assert created['name'] == new_user['name']
```

## Preparación con AIQUAA

AIQUAA ofrece:

- **API Testing Fundamentals** - Examen teórico con 5 niveles progresivos
- **API Banking Challenge** - Challenge práctico con API bancaria simulada
- **Enunciados y corrección automática** - 100 puntos posibles
- **Nivel intermedio-avanzado** - Cubre fundamentos y práctica

**Enlaces:**

- https://aiquaa.com/labs/api-testing-fundamentals
- https://aiquaa.com/assessments/api-banking

## Estadísticas del Mercado

- **Demanda de QA API:** +42% 2024 vs 2023 (fuente: LinkedIn Jobs)
- **Salario promedio QA API:** $75,000-110,000 USD
- **Herramienta más demandada:** Postman (65% de ofertas)
- **APIs más comunes:** REST (72%), GraphQL (18%), SOAP (10%)

## Fuentes

- Postman State of API Report 2024
- AIQUAA Labs: aiquaa.com/labs
- REST API Testing Best Practices
