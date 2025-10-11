Feature: Propagación de X-Request-Id y captura de IP sin mutar socket

  Scenario: Responder con X-Request-Id cuando no viene en la solicitud
    Given no envío el header "X-Request-Id"
    When hago un GET a "/api/v1/health"
    Then la respuesta es 200
    And la respuesta incluye el header "X-Request-Id"
    And "X-Request-Id" es un UUID v4 válido

  Scenario: Propagar X-Request-Id entrante
    Given envío el header "X-Request-Id" con valor "req-123"
    When hago un GET a "/api/v1/health"
    Then la respuesta es 200
    And la respuesta incluye el header "X-Request-Id" con valor "req-123"

  Scenario: No mutar req.socket.remoteAddress
    Given el cliente envía "X-Forwarded-For" con "203.0.113.10"
    When hago un GET a "/api/v1/health"
    Then la respuesta es 200
    And se usa la IP "203.0.113.10" para logs/metrics
    And no se intenta asignar a "req.socket.remoteAddress"
