Feature: X-Request-Id e IP sin mutar socket

  Scenario: Generar X-Request-Id si no viene
    Given no envío "X-Request-Id"
    When GET "/api/v1/health"
    Then status 200
    And header "X-Request-Id" existe y es UUID v4

  Scenario: Propagar X-Request-Id entrante
    Given envío "X-Request-Id" = "req-123"
    When GET "/api/v1/health"
    Then status 200
    And header "X-Request-Id" = "req-123"

  Scenario: No mutar req.socket.remoteAddress
    Given envío "X-Forwarded-For" = "203.0.113.10"
    When GET "/api/v1/health"
    Then status 200
    And el backend registra la IP "203.0.113.10" sin mutar el socket
