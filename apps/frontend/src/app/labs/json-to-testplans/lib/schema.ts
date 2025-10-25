import { z } from 'zod';

/**
 * Zod schema for test analysis JSON input
 * Supports both English and Spanish field names from AI-generated test case analysis
 */
export const TestAnalysisSchema = z.object({
  // Support both English and Spanish field names
  id_work_item: z.string().optional(),
  work_item_id: z.string().optional(),
  datos_jira: z
    .object({
      key: z.string().optional(),
      summary: z.string().optional(),
      description: z.string().optional(),
      issue_type: z.string().optional(),
      priority: z.string().optional(),
      status: z.string().optional(),
      acceptance_criteria: z.string().optional().nullable(),
      story_points: z.number().optional().nullable(),
      labels: z.array(z.string()).optional(),
      components: z.array(z.string()).optional(),
      fix_versions: z.array(z.string()).optional(),
      assignee: z.string().optional(),
      reporter: z.string().optional(),
      created: z.string().optional(),
      updated: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  jira_data: z
    .object({
      key: z.string().optional(),
      summary: z.string().optional(),
      description: z.string().optional(),
      issue_type: z.string().optional(),
      priority: z.string().optional(),
      status: z.string().optional(),
      acceptance_criteria: z.string().optional().nullable(),
      story_points: z.number().optional().nullable(),
      labels: z.array(z.string()).optional(),
      components: z.array(z.string()).optional(),
      fix_versions: z.array(z.string()).optional(),
      assignee: z.string().optional(),
      reporter: z.string().optional(),
      created: z.string().optional(),
      updated: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  id_analisis: z.string().optional(),
  analysis_id: z.string().optional(),
  estado: z.string().optional(),
  status: z.string().optional(),
  casos_prueba: z
    .array(
      z.object({
        id_caso_prueba: z.string().optional(),
        test_case_id: z.string().optional(),
        titulo: z.string().optional(),
        title: z.string().optional(),
        descripcion: z.string().optional().default(''),
        description: z.string().optional().default(''),
        tipo_prueba: z.string().optional().default(''),
        test_type: z.string().optional().default(''),
        prioridad: z.string().optional().default(''),
        priority: z.string().optional().default(''),
        pasos: z.array(z.string()).optional().default([]),
        steps: z.array(z.string()).optional().default([]),
        resultado_esperado: z.string().optional().default(''),
        expected_result: z.string().optional().default(''),
        precondiciones: z.array(z.string()).optional().default([]),
        preconditions: z.array(z.string()).optional().default([]),
        datos_prueba: z.record(z.string(), z.any()).optional().default({}),
        test_data: z.record(z.string(), z.any()).optional().default({}),
        potencial_automatizacion: z.string().optional().default(''),
        automation_potential: z.string().optional().default(''),
        duracion_estimada: z.string().optional().default(''),
        estimated_duration: z.string().optional().default(''),
      }).refine(
        (data) => {
          // Ensure at least one case ID is provided
          return data.id_caso_prueba || data.test_case_id;
        },
        {
          message: "Either 'id_caso_prueba' or 'test_case_id' must be provided",
          path: ["id_caso_prueba", "test_case_id"],
        }
      ).refine(
        (data) => {
          // Ensure at least one title is provided
          return data.titulo || data.title;
        },
        {
          message: "Either 'titulo' or 'title' must be provided",
          path: ["titulo", "title"],
        }
      )
    )
    .default([]),
  test_cases: z
    .array(
      z.object({
        id_caso_prueba: z.string().optional(),
        test_case_id: z.string().optional(),
        titulo: z.string().optional(),
        title: z.string().optional(),
        descripcion: z.string().optional().default(''),
        description: z.string().optional().default(''),
        tipo_prueba: z.string().optional().default(''),
        test_type: z.string().optional().default(''),
        prioridad: z.string().optional().default(''),
        priority: z.string().optional().default(''),
        pasos: z.array(z.string()).optional().default([]),
        steps: z.array(z.string()).optional().default([]),
        resultado_esperado: z.string().optional().default(''),
        expected_result: z.string().optional().default(''),
        precondiciones: z.array(z.string()).optional().default([]),
        preconditions: z.array(z.string()).optional().default([]),
        datos_prueba: z.record(z.string(), z.any()).optional().default({}),
        test_data: z.record(z.string(), z.any()).optional().default({}),
        potencial_automatizacion: z.string().optional().default(''),
        automation_potential: z.string().optional().default(''),
        duracion_estimada: z.string().optional().default(''),
        estimated_duration: z.string().optional().default(''),
      }).refine(
        (data) => {
          // Ensure at least one case ID is provided
          return data.id_caso_prueba || data.test_case_id;
        },
        {
          message: "Either 'id_caso_prueba' or 'test_case_id' must be provided",
          path: ["id_caso_prueba", "test_case_id"],
        }
      ).refine(
        (data) => {
          // Ensure at least one title is provided
          return data.titulo || data.title;
        },
        {
          message: "Either 'titulo' or 'title' must be provided",
          path: ["titulo", "title"],
        }
      )
    )
    .default([]),
  analisis_cobertura: z.record(z.string(), z.string()).optional(),
  coverage_analysis: z.record(z.string(), z.string()).optional(),
  puntuacion_confianza: z.number().optional(),
  confidence_score: z.number().optional(),
  tiempo_procesamiento: z.number().optional(),
  processing_time: z.number().optional(),
  fecha_creacion: z.string().optional(),
  created_at: z.string().optional(),
}).refine(
  (data) => {
    // Ensure at least one work item ID is provided
    return data.id_work_item || data.work_item_id;
  },
  {
    message: "Either 'id_work_item' or 'work_item_id' must be provided",
    path: ["id_work_item", "work_item_id"],
  }
).refine(
  (data) => {
    // Ensure at least one test cases array is provided
    return (data.casos_prueba && data.casos_prueba.length > 0) ||
           (data.test_cases && data.test_cases.length > 0);
  },
  {
    message: "Either 'casos_prueba' or 'test_cases' must be provided with at least one test case",
    path: ["casos_prueba", "test_cases"],
  }
);

export type TestAnalysis = z.infer<typeof TestAnalysisSchema>;
export type TestCase = TestAnalysis['casos_prueba'][number];

/**
 * Export options for CSV generation
 */
export interface ExportOptions {
  delimiter: ',' | ';';
  headerCase: 'snake_case' | 'camelCase' | 'Title Case';
  multilineJoin: '\\n' | '||';
  includeOptionalColumns: boolean;
  joinSteps: boolean;
  joinPreconditions: boolean;
}

/**
 * Processed CSV data ready for export
 */
export interface ProcessedData {
  plans: Array<Record<string, string>>;
  steps: Array<{ case_id: string; step_number: number; step_text: string }>;
  preconditions: Array<{
    case_id: string;
    precondition_number: number;
    precondition_text: string;
  }>;
  testdata: Array<{ case_id: string; key: string; value: string }>;
}
