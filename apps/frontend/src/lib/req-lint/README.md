# Requirements Linter

Analizador estático de requisitos basado en heurísticas ISTQB. Evalúa la calidad de requisitos de software sin usar IA, únicamente con reglas determinísticas.

## Características

- **Sin IA**: Análisis 100% determinístico con regex y checks
- **Heurísticas ISTQB**: Evalúa claridad, completitud, testabilidad, consistencia, factibilidad
- **RPN Score**: Risk Priority Number basado en severidad × probabilidad
- **Validación Gherkin**: Detecta y valida formato Given/When/Then
- **Cobertura**: Analiza entradas, salidas, manejo de errores, roles, NFRs
- **Exportación**: JSON completo con issues, scores y sugerencias

## Uso

```typescript
import { analyzeRequirement } from '@/lib/req-lint/engine';

const result = analyzeRequirement({
  requirement_id: 'REQ-001',
  requirement_text: 'El sistema debe responder rápido a las consultas...',
});

console.log(result.quality_score.overall); // 0-100
console.log(result.issues); // Lista de problemas detectados
console.log(result.summary); // Resumen ejecutivo
```

## Reglas Implementadas (v1)

### Ambigüedad

- **VagueTerm**: Detecta términos imprecisos (rápido, fácil, óptimo, varios, aprox)
- **FuzzyQuantifier**: Cuantificadores difusos (alrededor de, más o menos)
- **OpenRange**: Comparadores sin umbral (mayor que, menor que sin valor)
- **PassiveVoice**: Voz pasiva que oculta responsabilidades
- **PronounWithoutAntecedent**: Pronombres sin referencia clara (esto, eso, aquello)
- **TemporalDeixis**: Expresiones temporales vagas (pronto, en breve)

### Omisiones

- **TooShort**: Requisitos con < 30 caracteres
- **MissingInputOutput**: Falta especificación de entradas/salidas
- **MissingErrorHandling**: No se contempla manejo de errores

### NFR Gaps

- **PerfNoThreshold**: Mención de performance sin umbrales numéricos

### Responsabilidades

- **UndefinedRole**: No se identifica quién (usuario, sistema) realiza acciones

### Consistencia

- **GherkinInvalid**: Formato Gherkin incorrecto o incompleto

## Scores

El sistema calcula 6 dimensiones de calidad:

1. **Overall**: Score general (0-100)
2. **Clarity**: Claridad y precisión del lenguaje
3. **Completeness**: Información completa (entradas, salidas, errores)
4. **Consistency**: Consistencia interna y formato
5. **Feasibility**: Viabilidad técnica (NFRs definidos)
6. **Testability**: Facilidad de verificación

Cada issue reduce el score según:
- Critical: -12 puntos
- High: -8 puntos
- Medium: -5 puntos
- Low: -3 puntos

Bonificaciones:
- Gherkin válido: +5 testability
- Entradas/salidas definidas: +5 completeness, +5 testability
- Manejo de errores: +3 completeness, +3 feasibility
- Roles definidos: +3 clarity
- Contratos de datos: +3 completeness, +3 testability

## RPN (Risk Priority Number)

RPN = Severidad × Probabilidad

Valores:
- Severidad: Low(1), Medium(2), High(3), Critical(3)
- Probabilidad: Low(1), Medium(2), High(3)

Rango: 1-9 (mayor RPN = mayor prioridad de corrección)

## Estructura de Salida

```typescript
{
  requirement_id: string;
  quality_score: {
    overall: number;
    clarity: number;
    completeness: number;
    consistency: number;
    feasibility: number;
    testability: number;
  };
  issues: Array<{
    id: string;
    type: "Ambiguity" | "Omission" | "Inconsistency" | "NFRGap" | ...;
    heuristic: "VagueTerm" | "PerfNoThreshold" | ...;
    excerpt: string;
    explanation: string;
    impact_area: ("Testability" | "Performance" | "UX" | ...)[];
    severity: "Low" | "Medium" | "High" | "Critical";
    likelihood: "Low" | "Medium" | "High";
    rpn: number;
    fix_suggestion: string;
    proposed_rewrite?: string;
  }>;
  coverage: {
    inputs_defined: boolean;
    outputs_defined: boolean;
    business_rules: string[];
    error_handling_defined: boolean;
    roles_responsibilities_defined: boolean;
    data_contracts_defined: boolean;
    nfr_defined: string[];
  };
  acceptance_criteria: Array<{
    id: string;
    format: "GWT" | "Checklist";
    criterion: string;
    measurable: boolean;
    test_oracle?: string;
  }>;
  traceability: {
    glossary_terms_used: string[];
    external_refs_needed: string[];
    dependencies_touched: string[];
  };
  summary: string;
}
```

## Ejemplo

**Entrada:**
```
El sistema deberá responder rápido a las consultas de saldo.
Registrar esto y mostrarlo al usuario.
```

**Issues detectados:**
- VagueTerm: "rápido" (sin SLO definido)
- PronounWithoutAntecedent: "esto" (sin antecedente claro)
- MissingInputOutput: Faltan entradas definidas
- MissingInputOutput: Faltan salidas definidas
- PerfNoThreshold: "responder" sin umbral de tiempo

**Score**: ~40-50/100

**Sugerencia:**
```
Dado que el usuario está autenticado,
cuando solicita su saldo mediante GET /api/balance,
entonces el sistema retorna un JSON con el campo 'balance' tipo decimal(12,2)
con tiempo de respuesta p95 ≤ 200ms.
En caso de error de autenticación, retorna HTTP 401.
```

## Archivos

```
src/lib/req-lint/
├── schemas.ts          # Tipos TypeScript
├── rules-v1.ts         # Definición de reglas y regex
├── gherkin.ts          # Validador Gherkin
├── engine.ts           # Motor de análisis
├── __tests__/
│   └── engine.spec.ts  # Tests unitarios (17 tests)
└── README.md           # Este archivo
```

## Tests

```bash
pnpm test src/lib/req-lint/__tests__/engine.spec.ts
```

17 tests que cubren:
- Detección de cada heurística
- Validación Gherkin (válido e inválido)
- Cálculo de scores
- Generación de criterios de aceptación
- Detección de NFRs y reglas de negocio

## UI

Página web en `/labs/req-lint` con:
- Textarea para ingresar requisito
- 3 ejemplos precargados
- Visualización de scores (barras de progreso)
- Tabla de issues con filtros por severidad y tipo
- Checkmarks de cobertura
- Criterios de aceptación generados
- Botones: Copiar JSON, Descargar JSON
- Toggle para mostrar reescrituras propuestas

## Limitaciones

- Solo detecta patrones en español
- No entiende contexto semántico (sin IA)
- Regex puede dar falsos positivos en casos muy específicos
- No valida coherencia entre múltiples requisitos

## Próximas versiones (v2)

- Soporte multiidioma (inglés, portugués)
- Detección de conflictos entre requisitos
- Integración con glosarios externos
- Análisis de trazabilidad vertical (épicas → historias → tareas)
- Export a Word/PDF con reporte formateado
- API REST para CI/CD pipelines
