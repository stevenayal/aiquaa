import { z } from 'zod';

/**
 * Zod schema for test analysis JSON input
 * Validates the structure of AI-generated test case analysis
 */
export const TestAnalysisSchema = z.object({
  id_work_item: z.string().optional(),
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
  id_analisis: z.string().optional(),
  estado: z.string().optional(),
  casos_prueba: z
    .array(
      z.object({
        id_caso_prueba: z.string(),
        titulo: z.string(),
        descripcion: z.string().optional().default(''),
        tipo_prueba: z.string().optional().default(''),
        prioridad: z.string().optional().default(''),
        pasos: z.array(z.string()).optional().default([]),
        resultado_esperado: z.string().optional().default(''),
        precondiciones: z.array(z.string()).optional().default([]),
        datos_prueba: z.record(z.string(), z.any()).optional().default({}),
        potencial_automatizacion: z.string().optional().default(''),
        duracion_estimada: z.string().optional().default(''),
      })
    )
    .default([]),
  analisis_cobertura: z.record(z.string(), z.string()).optional(),
  puntuacion_confianza: z.number().optional(),
  tiempo_procesamiento: z.number().optional(),
  fecha_creacion: z.string().optional(),
});

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
