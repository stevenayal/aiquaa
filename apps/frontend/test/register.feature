Feature: Registro de Usuario
  Como usuario del sistema
  Quiero poder registrarme con mis datos personales
  Para poder acceder a la plataforma

  Background:
    Given que el sistema está configurado correctamente
    And que el backend está disponible

  Scenario: Registro exitoso con datos válidos
    Given que tengo los siguientes datos de registro:
      | campo    | valor                    |
      | email    | usuario@ejemplo.com      |
      | name     | Juan Pérez               |
      | password | miPassword123            |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 200
    And la respuesta debería contener un token de acceso
    And la respuesta debería incluir información del usuario

  Scenario: Error al registrar con email inválido
    Given que tengo los siguientes datos de registro:
      | campo    | valor           |
      | email    | email-invalido  |
      | name     | Juan Pérez      |
      | password | miPassword123   |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 400
    And la respuesta debería contener el mensaje "Formato de email inválido"

  Scenario: Error al registrar con contraseña muy corta
    Given que tengo los siguientes datos de registro:
      | campo    | valor           |
      | email    | usuario@ejemplo.com |
      | name     | Juan Pérez      |
      | password | 123             |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 400
    And la respuesta debería contener el mensaje "La contraseña debe tener al menos 8 caracteres"

  Scenario: Error al registrar con nombre muy corto
    Given que tengo los siguientes datos de registro:
      | campo    | valor           |
      | email    | usuario@ejemplo.com |
      | name     | J               |
      | password | miPassword123   |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 400
    And la respuesta debería contener el mensaje "El nombre debe tener al menos 2 caracteres"

  Scenario: Error al registrar con campos faltantes
    Given que tengo los siguientes datos de registro:
      | campo    | valor           |
      | email    | usuario@ejemplo.com |
      | name     |                 |
      | password | miPassword123   |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 400
    And la respuesta debería contener el mensaje "Email, name y password son requeridos"

  Scenario: Sanitización de nombre con caracteres peligrosos
    Given que tengo los siguientes datos de registro:
      | campo    | valor                    |
      | email    | usuario@ejemplo.com      |
      | name     | Juan<script>alert('xss')</script> |
      | password | miPassword123            |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 200
    And el nombre debería estar sanitizado sin caracteres peligrosos

  Scenario: Timeout del servidor backend
    Given que el backend no responde en 30 segundos
    And que tengo los siguientes datos de registro:
      | campo    | valor                    |
      | email    | usuario@ejemplo.com      |
      | name     | Juan Pérez               |
      | password | miPassword123            |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 504
    And la respuesta debería contener el mensaje "Timeout del servidor. Intenta nuevamente."

  Scenario: Error de conexión con el backend
    Given que el backend no está disponible
    And que tengo los siguientes datos de registro:
      | campo    | valor                    |
      | email    | usuario@ejemplo.com      |
      | name     | Juan Pérez               |
      | password | miPassword123            |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 502
    And la respuesta debería contener el mensaje "No se pudo contactar con el servidor. Verifica tu conexión."

  Scenario: Error interno del servidor
    Given que ocurre un error interno inesperado
    And que tengo los siguientes datos de registro:
      | campo    | valor                    |
      | email    | usuario@ejemplo.com      |
      | name     | Juan Pérez               |
      | password | miPassword123            |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 500
    And la respuesta debería contener el mensaje "Error interno del servidor. Intenta nuevamente."

  Scenario: Configuración incorrecta del backend
    Given que la variable BACKEND_URL no está configurada
    And que tengo los siguientes datos de registro:
      | campo    | valor                    |
      | email    | usuario@ejemplo.com      |
      | name     | Juan Pérez               |
      | password | miPassword123            |
    When envío una solicitud POST a "/api/register"
    Then debería recibir una respuesta con status 500
    And la respuesta debería contener el mensaje "BACKEND_URL not set"
