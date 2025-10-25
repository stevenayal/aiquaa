# JSON to Test Plans

Herramienta web para convertir JSON de análisis de pruebas generado por IA en archivos CSV normalizados listos para importar en herramientas de gestión de pruebas.

## Características

- **Validación robusta**: Esquema Zod con validación estricta de tipos
- **4 CSV diferentes**: Plans, Steps, Preconditions, Test Data
- **Opciones flexibles**: Delimitadores, formato de encabezados, separadores multilínea
- **Preview interactivo**: Tablas paginadas para visualizar los datos antes de exportar
- **Client-side only**: Todo el procesamiento se realiza en el navegador, sin enviar datos al servidor
- **Dark mode**: Soporte completo para tema oscuro
- **LocalStorage**: Persistencia automática de la última configuración
- **Fixture de ejemplo**: JSON demo precargado (KAN-6) para probar rápidamente

## Ubicación

```
/labs/json-to-testplans
```

## Uso básico

1. **Cargar JSON**:
   - Pegar JSON en el textarea
   - Usar botón "Subir archivo .json"
   - Usar botón "Cargar demo (KAN-6)" para ejemplo precargado

2. **Validar y procesar**:
   - Click en "Cargar y Validar JSON"
   - El sistema valida el esquema y muestra errores detallados si hay problemas

3. **Configurar opciones de exportación**:
   - Delimitador: `,` o `;`
   - Formato de encabezados: `snake_case`, `camelCase`, o `Title Case`
   - Salto de línea: `\n` o `||`
   - Columnas opcionales (Jira metadata, timestamps)
   - Unir pasos/precondiciones en el CSV principal

4. **Preview y exportación**:
   - Navegar entre tabs (Plans, Steps, Preconditions, Test Data)
   - Ver preview con paginación (50 registros por página)
   - Exportar CSV individual o todos a la vez
   - Copiar CSV al portapapeles

## Esquema JSON esperado

```json
{
  "id_work_item": "KAN-6",
  "datos_jira": {
    "key": "KAN-6",
    "summary": "Título del work item",
    "description": "Descripción",
    "issue_type": "Story",
    "priority": "High",
    "status": "In Progress",
    "acceptance_criteria": "Criterios...",
    "story_points": 8,
    "labels": ["tag1", "tag2"],
    "components": ["Component A"],
    "fix_versions": ["v1.0"],
    "assignee": "user@example.com",
    "reporter": "reporter@example.com",
    "created": "2025-10-15T10:30:00Z",
    "updated": "2025-10-20T14:45:00Z",
    "url": "https://jira.example.com/browse/KAN-6"
  },
  "id_analisis": "ANALYSIS-001",
  "estado": "completado",
  "casos_prueba": [
    {
      "id_caso_prueba": "TC001",
      "titulo": "Título del caso de prueba",
      "descripcion": "Descripción detallada",
      "tipo_prueba": "Funcional",
      "prioridad": "Alta",
      "pasos": [
        "Paso 1",
        "Paso 2",
        "Paso 3"
      ],
      "resultado_esperado": "El sistema debe...",
      "precondiciones": [
        "Usuario autenticado",
        "Base de datos inicializada"
      ],
      "datos_prueba": {
        "usuario": "test@example.com",
        "password": "test123"
      },
      "potencial_automatizacion": "Alto",
      "duracion_estimada": "30 min"
    }
  ],
  "analisis_cobertura": {
    "funcional": "100%",
    "borde": "80%",
    "integracion": "75%",
    "seguridad": "60%",
    "usabilidad": "70%"
  },
  "puntuacion_confianza": 0.92,
  "tiempo_procesamiento": 3.5,
  "fecha_creacion": "2025-10-20T16:30:00Z"
}
```

### Campos requeridos

- `casos_prueba[].id_caso_prueba`: ID único del caso de prueba
- `casos_prueba[].titulo`: Título del caso de prueba

Todos los demás campos son opcionales y tienen valores por defecto.

## Mapeo de CSVs

### 1. plans.csv (1 fila por caso de prueba)

**Encabezados fijos**:
```
work_item_key, work_item_summary, analysis_id, case_id, title, description,
test_type, priority, expected_result, automation_potential, estimated_duration,
coverage_functional, coverage_edge, coverage_integration, coverage_security, coverage_usability
```

**Encabezados opcionales** (si `includeOptionalColumns` está activado):
```
jira_status, jira_priority, jira_assignee, jira_reporter, jira_url,
created_at, updated_at
```

**Encabezados condicionales**:
- `steps_joined`: Si `joinSteps` está activado
- `preconditions_joined`: Si `joinPreconditions` está activado

### 2. steps.csv (N filas por caso)

```
case_id, step_number, step_text
```

- `step_number`: 1-based index
- No se genera si `joinSteps` está activado

### 3. preconditions.csv

```
case_id, precondition_number, precondition_text
```

- `precondition_number`: 1-based index
- No se genera si `joinPreconditions` está activado

### 4. testdata.csv (desnormalizado clave-valor)

```
case_id, key, value
```

**Reglas de procesamiento**:
- Si `datos_prueba` es objeto: aplana 1 nivel
- Si es string JSON válido: parsea y aplana
- Si es texto plano: `key="raw", value=texto`

## Reglas de normalización

### Texto
- Trim de espacios
- Colapso de espacios múltiples en uno
- Sanitización de caracteres especiales para CSV

### Duración estimada
Normaliza a minutos:
- `"30 min"` → `"30"`
- `"1h"` → `"60"`
- `"1.5 hours"` → `"90"`
- `"30"` → `"30"`

### CSV Export
- **UTF-8 BOM**: Incluido para compatibilidad con Excel
- **Escape**: Valores con comas, comillas o saltos de línea se escapan automáticamente
- **Delimitador personalizable**: `,` (default) o `;`

## Opciones de exportación

| Opción | Valores | Default | Descripción |
|--------|---------|---------|-------------|
| `delimiter` | `,` o `;` | `,` | Separador de columnas |
| `headerCase` | `snake_case`, `camelCase`, `Title Case` | `snake_case` | Formato de encabezados |
| `multilineJoin` | `\n` o `\|\|` | `\n` | Separador para campos multilínea |
| `includeOptionalColumns` | `boolean` | `true` | Incluir metadata de Jira y timestamps |
| `joinSteps` | `boolean` | `false` | Unir pasos en plans.csv |
| `joinPreconditions` | `boolean` | `false` | Unir precondiciones en plans.csv |

## Manejo de errores

### JSON inválido
Muestra el error con línea y columna, más un ejemplo de formato válido.

### Validación Zod
Lista todos los errores de validación con ruta de campo y descripción:
```
casos_prueba.0.id_caso_prueba: Required
casos_prueba.0.titulo: Required
```

### Casos de prueba vacíos
Muestra advertencia: "No se encontraron casos de prueba en el JSON"

### Campos faltantes
Los campos opcionales usan valores por defecto (`''`, `[]`, `{}`), sin romper el export.

## Performance

- **Grandes volúmenes**: Soporta ≥2,000 casos sin bloquear UI
- **Paginación**: 50 registros por página en preview
- **LocalStorage**: Persistencia automática de última configuración
- **Client-side**: Todo el procesamiento es local, sin latencia de red

## Testing

### Unit tests (28 tests)
```bash
pnpm --filter @aiquaa/frontend test src/app/labs/json-to-testplans/__tests__/
```

Cubre:
- Normalización de texto
- Extracción de minutos
- Aplanado de objetos
- Conversión de headers
- Transformación JSON → CSV
- Manejo de campos opcionales

### E2E tests (18 scenarios)
```bash
pnpm --filter @aiquaa/frontend e2e -- json-to-testplans
```

Cubre:
- Carga de demo
- Validación de JSON
- Cambio de opciones
- Navegación de tabs
- Exportación de CSV
- Copia al portapapeles
- Paginación
- Manejo de errores
- Persistencia en localStorage

## Estructura de archivos

```
apps/frontend/src/app/labs/json-to-testplans/
├── lib/
│   ├── schema.ts              # Esquema Zod + tipos TypeScript
│   ├── transformers.ts        # Lógica de transformación JSON → CSV
│   ├── utils.ts               # Funciones auxiliares (normalización, etc.)
│   └── csv-generator.ts       # Generación y descarga de CSV (Papaparse)
├── components/
│   ├── JsonInputCard.tsx      # Input + upload + demo
│   ├── ExportOptionsCard.tsx  # Configuración de opciones
│   └── PreviewCard.tsx        # Tabs + tablas paginadas
├── __tests__/
│   ├── utils.test.ts          # Tests de utilidades
│   └── transformers.test.ts   # Tests de transformación
├── page.tsx                   # Página principal
└── README.md                  # Esta documentación
```

## Dependencias

- `zod` (^4.1): Validación de esquema
- `papaparse` (^5.5): Generación de CSV
- React hooks: `useState`, `useEffect`
- Tailwind CSS: Estilos
- No requiere shadcn/ui components adicionales

## Limitaciones conocidas

1. **Aplanado de objetos**: Solo 1 nivel de profundidad en `datos_prueba`
2. **Duración**: Extracción heurística, puede fallar con formatos no estándar
3. **Cobertura**: Mapea solo los campos conocidos (`funcional`, `borde`, etc.)
4. **Tamaño de archivo**: El navegador puede tener límites para archivos muy grandes (>100MB)

## Seguridad

- ✅ Todo client-side, sin backend
- ✅ No se envían datos a ningún servidor
- ✅ Sanitización de preview (no ejecuta HTML)
- ✅ Tipos estrictos (TypeScript + Zod)
- ✅ LocalStorage limitado a 5MB aprox.

## Mejoras futuras

- [ ] Soporte para exportar a Excel (.xlsx)
- [ ] Templates personalizables de mapeo
- [ ] Validación avanzada con reglas custom
- [ ] Importación desde URL
- [ ] Historial de exports
- [ ] Comparación de versiones de JSON

## Soporte

Para reportar bugs o solicitar features:
- GitHub Issues: [anthropics/claude-code/issues](https://github.com/anthropics/claude-code/issues)
- Documentación: `/labs/json-to-testplans` en la aplicación

## Licencia

MIT - Ver LICENSE en el repositorio principal.
