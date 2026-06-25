export const API_CHALLENGE_EVALUATION_CRITERIA = [
  {
    key: 'testDesignScore',
    label: 'Diseno de casos de prueba',
    maxScore: 30,
    summary:
      'Se evalua si los casos cubren escenarios relevantes de la API elegida.',
    fullCredit:
      'Para obtener el puntaje completo, incluye casos positivos, negativos, de borde, contrato y seguridad cuando aplique. Cada caso debe tener titulo claro, precondiciones si hacen falta, pasos reproducibles y resultado esperado verificable.',
    checks: [
      'Variedad de tipos de prueba, no solo happy path.',
      'Cobertura de endpoints, parametros, filtros, paginacion o fechas segun la API elegida.',
      'Pasos suficientemente claros para que otra persona pueda repetirlos.',
    ],
  },
  {
    key: 'apiValidationScore',
    label: 'Ejecucion y evidencia',
    maxScore: 25,
    summary:
      'Se evalua si la ejecucion real de requests esta documentada con evidencia.',
    fullCredit:
      'Para obtener el puntaje completo, registra metodo, URL completa, parametros, status code observado, fragmento relevante del body y evidencia como curl, captura, JSON parcial o timestamp.',
    checks: [
      'URLs y datos de prueba concretos.',
      'Status codes y respuestas observadas.',
      'Evidencia suficiente para reproducir el resultado.',
    ],
  },
  {
    key: 'securityScore',
    label: 'Analisis de contrato y datos',
    maxScore: 20,
    summary:
      'Se evalua si validas la estructura, tipos de datos y comportamiento documentado.',
    fullCredit:
      'Para obtener el puntaje completo, analiza schema, campos obligatorios, tipos, errores, filtros, paginacion, limites, fechas o rate limits segun corresponda.',
    checks: [
      'Validacion de campos requeridos y tipos de respuesta.',
      'Comparacion entre documentacion y respuesta real.',
      'Analisis de errores y parametros invalidos.',
    ],
  },
  {
    key: 'bugReportingScore',
    label: 'Calidad de hallazgos y reportes',
    maxScore: 15,
    summary:
      'Se evalua la claridad profesional de los bugs, riesgos o mejoras reportadas.',
    fullCredit:
      'Para obtener el puntaje completo, cada hallazgo debe explicar impacto, severidad, prioridad, pasos para reproducir, resultado actual, resultado esperado y evidencia.',
    checks: [
      'El hallazgo puede ser bug real, riesgo, inconsistencia, limitacion o mejora testable.',
      'Severidad y prioridad justificadas.',
      'Impacto explicado desde usuario, negocio, datos o calidad del producto.',
    ],
  },
  {
    key: 'executiveSummaryScore',
    label: 'Resumen ejecutivo',
    maxScore: 10,
    summary:
      'Se evalua si sintetizas el trabajo de forma clara para una persona tecnica o de negocio.',
    fullCredit:
      'Para obtener el puntaje completo, resume alcance, cobertura, hallazgos principales, riesgos, limitaciones y recomendacion final en al menos 150 caracteres.',
    checks: [
      'Sintesis de cobertura y alcance probado.',
      'Riesgos y hallazgos principales priorizados.',
      'Recomendacion final accionable.',
    ],
  },
] as const;

export const API_CHALLENGE_TOTAL_SCORE =
  API_CHALLENGE_EVALUATION_CRITERIA.reduce(
    (total, criterion) => total + criterion.maxScore,
    0
  );
