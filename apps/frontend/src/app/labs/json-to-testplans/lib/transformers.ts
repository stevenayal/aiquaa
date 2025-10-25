import { TestAnalysis, TestCase, ProcessedData, ExportOptions } from './schema';
import { normalizeText, extractMinutes, flattenObject } from './utils';

/**
 * Transform test analysis JSON to processed CSV data
 */
export function transformToCSV(
  data: TestAnalysis,
  options: ExportOptions
): ProcessedData {
  const plans: Array<Record<string, string>> = [];
  const steps: Array<{ case_id: string; step_number: number; step_text: string }> = [];
  const preconditions: Array<{
    case_id: string;
    precondition_number: number;
    precondition_text: string;
  }> = [];
  const testdata: Array<{ case_id: string; key: string; value: string }> = [];

  // Process each test case
  data.casos_prueba.forEach((testCase) => {
    // Build plan row
    const planRow = buildPlanRow(data, testCase, options);
    plans.push(planRow);

    // Process steps
    if (!options.joinSteps && testCase.pasos && testCase.pasos.length > 0) {
      testCase.pasos.forEach((step, index) => {
        steps.push({
          case_id: testCase.id_caso_prueba,
          step_number: index + 1,
          step_text: normalizeText(step),
        });
      });
    }

    // Process preconditions
    if (
      !options.joinPreconditions &&
      testCase.precondiciones &&
      testCase.precondiciones.length > 0
    ) {
      testCase.precondiciones.forEach((precondition, index) => {
        preconditions.push({
          case_id: testCase.id_caso_prueba,
          precondition_number: index + 1,
          precondition_text: normalizeText(precondition),
        });
      });
    }

    // Process test data
    if (testCase.datos_prueba) {
      const testDataEntries = processTestData(testCase.datos_prueba);
      testDataEntries.forEach(({ key, value }) => {
        testdata.push({
          case_id: testCase.id_caso_prueba,
          key,
          value,
        });
      });
    }
  });

  return { plans, steps, preconditions, testdata };
}

/**
 * Build a plan CSV row from test case data
 */
function buildPlanRow(
  data: TestAnalysis,
  testCase: TestCase,
  options: ExportOptions
): Record<string, string> {
  const jira = data.datos_jira || {};
  const coverage = data.analisis_cobertura || {};

  const row: Record<string, string> = {
    work_item_key: jira.key || data.id_work_item || '',
    work_item_summary: normalizeText(jira.summary || ''),
    analysis_id: data.id_analisis || '',
    case_id: testCase.id_caso_prueba,
    title: normalizeText(testCase.titulo),
    description: normalizeText(testCase.descripcion || ''),
    test_type: normalizeText(testCase.tipo_prueba || ''),
    priority: normalizeText(testCase.prioridad || ''),
    expected_result: normalizeText(testCase.resultado_esperado || ''),
    automation_potential: normalizeText(testCase.potencial_automatizacion || ''),
    estimated_duration: extractMinutes(testCase.duracion_estimada || ''),
  };

  // Add joined steps if requested
  if (options.joinSteps && testCase.pasos && testCase.pasos.length > 0) {
    const separator = options.multilineJoin === '\\n' ? '\n' : '||';
    row.steps_joined = testCase.pasos
      .map((s) => normalizeText(s))
      .join(separator);
  }

  // Add joined preconditions if requested
  if (
    options.joinPreconditions &&
    testCase.precondiciones &&
    testCase.precondiciones.length > 0
  ) {
    const separator = options.multilineJoin === '\\n' ? '\n' : '||';
    row.preconditions_joined = testCase.precondiciones
      .map((p) => normalizeText(p))
      .join(separator);
  }

  // Add optional Jira columns
  if (options.includeOptionalColumns) {
    row.jira_status = normalizeText(jira.status || '');
    row.jira_priority = normalizeText(jira.priority || '');
    row.jira_assignee = normalizeText(jira.assignee || '');
    row.jira_reporter = normalizeText(jira.reporter || '');
    row.jira_url = jira.url || '';
  }

  // Add coverage columns
  row.coverage_functional = normalizeText((coverage?.funcional || coverage?.functional) || '');
  row.coverage_edge = normalizeText((coverage?.borde || coverage?.edge) || '');
  row.coverage_integration = normalizeText((coverage?.integracion || coverage?.integration) || '');
  row.coverage_security = normalizeText((coverage?.seguridad || coverage?.security) || '');
  row.coverage_usability = normalizeText((coverage?.usabilidad || coverage?.usability) || '');

  // Add timestamps
  if (options.includeOptionalColumns) {
    row.created_at = jira.created || data.fecha_creacion || '';
    row.updated_at = jira.updated || '';
  }

  return row;
}

/**
 * Process test data into key-value pairs
 */
function processTestData(
  datos: Record<string, any>
): Array<{ key: string; value: string }> {
  const entries: Array<{ key: string; value: string }> = [];

  // If it's a string, try to parse as JSON
  if (typeof datos === 'string') {
    try {
      const parsed = JSON.parse(datos);
      if (typeof parsed === 'object' && parsed !== null) {
        const flattened = flattenObject(parsed);
        Object.entries(flattened).forEach(([key, value]) => {
          entries.push({ key, value: String(value) });
        });
      } else {
        entries.push({ key: 'raw', value: normalizeText(datos) });
      }
    } catch {
      // Not valid JSON, treat as plain text
      entries.push({ key: 'raw', value: normalizeText(datos) });
    }
  } else if (typeof datos === 'object' && datos !== null) {
    // Flatten one level
    const flattened = flattenObject(datos);
    Object.entries(flattened).forEach(([key, value]) => {
      entries.push({ key, value: String(value) });
    });
  }

  return entries;
}
