import { TestAnalysis, TestCase, ProcessedData, ExportOptions } from './schema';
import { normalizeText, extractMinutes, flattenObject } from './utils';

/**
 * Transform test analysis JSON to processed CSV data
 * Supports both English and Spanish field names
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

  // Get test cases from either Spanish or English field
  const testCases = data.casos_prueba || data.test_cases || [];

  // Process each test case
  testCases.forEach((testCase) => {
    // Build plan row
    const planRow = buildPlanRow(data, testCase, options);
    plans.push(planRow);

    // Get case ID from either Spanish or English field
    const caseId = testCase.id_caso_prueba || testCase.test_case_id || '';

    // Process steps
    const stepsArray = testCase.pasos || testCase.steps || [];
    if (!options.joinSteps && stepsArray.length > 0) {
      stepsArray.forEach((step, index) => {
        steps.push({
          case_id: caseId,
          step_number: index + 1,
          step_text: normalizeText(step),
        });
      });
    }

    // Process preconditions
    const preconditionsArray = testCase.precondiciones || testCase.preconditions || [];
    if (!options.joinPreconditions && preconditionsArray.length > 0) {
      preconditionsArray.forEach((precondition, index) => {
        preconditions.push({
          case_id: caseId,
          precondition_number: index + 1,
          precondition_text: normalizeText(precondition),
        });
      });
    }

    // Process test data
    const testData = testCase.datos_prueba || testCase.test_data;
    if (testData) {
      const testDataEntries = processTestData(testData);
      testDataEntries.forEach(({ key, value }) => {
        testdata.push({
          case_id: caseId,
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
 * Supports both English and Spanish field names
 */
function buildPlanRow(
  data: TestAnalysis,
  testCase: TestCase,
  options: ExportOptions
): Record<string, string> {
  // Get Jira data from either Spanish or English field
  const jira = data.datos_jira || data.jira_data || {};

  // Get coverage data from either Spanish or English field
  const coverage = data.analisis_cobertura || data.coverage_analysis || {};

  // Get work item ID from either Spanish or English field
  const workItemId = data.id_work_item || data.work_item_id || '';

  // Get analysis ID from either Spanish or English field
  const analysisId = data.id_analisis || data.analysis_id || '';

  // Get test case fields from either Spanish or English
  const caseId = testCase.id_caso_prueba || testCase.test_case_id || '';
  const title = testCase.titulo || testCase.title || '';
  const description = testCase.descripcion || testCase.description || '';
  const testType = testCase.tipo_prueba || testCase.test_type || '';
  const priority = testCase.prioridad || testCase.priority || '';
  const expectedResult = testCase.resultado_esperado || testCase.expected_result || '';
  const automationPotential = testCase.potencial_automatizacion || testCase.automation_potential || '';
  const estimatedDuration = testCase.duracion_estimada || testCase.estimated_duration || '';

  const row: Record<string, string> = {
    work_item_key: jira.key || workItemId,
    work_item_summary: normalizeText(jira.summary || ''),
    analysis_id: analysisId,
    case_id: caseId,
    title: normalizeText(title),
    description: normalizeText(description),
    test_type: normalizeText(testType),
    priority: normalizeText(priority),
    expected_result: normalizeText(expectedResult),
    automation_potential: normalizeText(automationPotential),
    estimated_duration: extractMinutes(estimatedDuration),
  };

  // Add joined steps if requested
  const stepsArray = testCase.pasos || testCase.steps || [];
  if (options.joinSteps && stepsArray.length > 0) {
    const separator = options.multilineJoin === '\\n' ? '\n' : '||';
    row.steps_joined = stepsArray
      .map((s) => normalizeText(s))
      .join(separator);
  }

  // Add joined preconditions if requested
  const preconditionsArray = testCase.precondiciones || testCase.preconditions || [];
  if (options.joinPreconditions && preconditionsArray.length > 0) {
    const separator = options.multilineJoin === '\\n' ? '\n' : '||';
    row.preconditions_joined = preconditionsArray
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

  // Add coverage columns (support both Spanish and English field names)
  row.coverage_functional = normalizeText(
    (coverage?.funcional || coverage?.functional_coverage) || ''
  );
  row.coverage_edge = normalizeText(
    (coverage?.borde || coverage?.edge_case_coverage) || ''
  );
  row.coverage_integration = normalizeText(
    (coverage?.integracion || coverage?.integration_coverage) || ''
  );
  row.coverage_security = normalizeText(
    (coverage?.seguridad || coverage?.security_coverage) || ''
  );
  row.coverage_usability = normalizeText(
    (coverage?.usabilidad || coverage?.usability_coverage) || ''
  );

  // Add timestamps
  if (options.includeOptionalColumns) {
    const createdAt = data.fecha_creacion || data.created_at || '';
    row.created_at = jira.created || createdAt;
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
