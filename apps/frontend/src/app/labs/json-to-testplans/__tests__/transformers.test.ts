import { describe, it, expect } from 'vitest';
import { transformToCSV } from '../lib/transformers';
import { TestAnalysis, ExportOptions } from '../lib/schema';

const mockTestAnalysis: TestAnalysis = {
  id_work_item: 'TEST-1',
  datos_jira: {
    key: 'TEST-1',
    summary: 'Test summary',
    priority: 'High',
    status: 'In Progress',
    assignee: 'john@example.com',
    url: 'https://jira.example.com/TEST-1',
  },
  casos_prueba: [
    {
      id_caso_prueba: 'TC001',
      titulo: 'Test case 1',
      descripcion: 'Test description',
      tipo_prueba: 'Funcional',
      prioridad: 'Alta',
      pasos: ['Step 1', 'Step 2', 'Step 3'],
      resultado_esperado: 'Expected result',
      precondiciones: ['Precondition 1', 'Precondition 2'],
      datos_prueba: {
        usuario: 'test@example.com',
        password: 'test123',
      },
      potencial_automatizacion: 'Alto',
      duracion_estimada: '30 min',
    },
    {
      id_caso_prueba: 'TC002',
      titulo: 'Test case 2',
      descripcion: '',
      tipo_prueba: '',
      prioridad: '',
      pasos: ['Step A'],
      resultado_esperado: '',
      precondiciones: [],
      datos_prueba: {},
      potencial_automatizacion: '',
      duracion_estimada: '',
    },
  ],
  analisis_cobertura: {
    funcional: '100%',
    borde: '80%',
  },
};

const defaultOptions: ExportOptions = {
  delimiter: ',',
  headerCase: 'snake_case',
  multilineJoin: '\\n',
  includeOptionalColumns: true,
  joinSteps: false,
  joinPreconditions: false,
};

describe('transformToCSV', () => {
  it('should transform test analysis to CSV data', () => {
    const result = transformToCSV(mockTestAnalysis, defaultOptions);

    expect(result.plans).toHaveLength(2);
    expect(result.plans[0]).toHaveProperty('case_id', 'TC001');
    expect(result.plans[0]).toHaveProperty('title', 'Test case 1');
    expect(result.plans[0]).toHaveProperty('work_item_key', 'TEST-1');
  });

  it('should generate separate steps', () => {
    const result = transformToCSV(mockTestAnalysis, defaultOptions);

    expect(result.steps).toHaveLength(4);
    expect(result.steps[0]).toEqual({
      case_id: 'TC001',
      step_number: 1,
      step_text: 'Step 1',
    });
    expect(result.steps[3]).toEqual({
      case_id: 'TC002',
      step_number: 1,
      step_text: 'Step A',
    });
  });

  it('should generate separate preconditions', () => {
    const result = transformToCSV(mockTestAnalysis, defaultOptions);

    expect(result.preconditions).toHaveLength(2);
    expect(result.preconditions[0]).toEqual({
      case_id: 'TC001',
      precondition_number: 1,
      precondition_text: 'Precondition 1',
    });
  });

  it('should generate test data key-value pairs', () => {
    const result = transformToCSV(mockTestAnalysis, defaultOptions);

    expect(result.testdata).toHaveLength(2);
    expect(result.testdata).toContainEqual({
      case_id: 'TC001',
      key: 'usuario',
      value: 'test@example.com',
    });
    expect(result.testdata).toContainEqual({
      case_id: 'TC001',
      key: 'password',
      value: 'test123',
    });
  });

  it('should join steps when option is enabled', () => {
    const options = { ...defaultOptions, joinSteps: true };
    const result = transformToCSV(mockTestAnalysis, options);

    expect(result.steps).toHaveLength(0);
    expect(result.plans[0]).toHaveProperty(
      'steps_joined',
      'Step 1\nStep 2\nStep 3'
    );
  });

  it('should join preconditions when option is enabled', () => {
    const options = { ...defaultOptions, joinPreconditions: true };
    const result = transformToCSV(mockTestAnalysis, options);

    expect(result.preconditions).toHaveLength(0);
    expect(result.plans[0]).toHaveProperty(
      'preconditions_joined',
      'Precondition 1\nPrecondition 2'
    );
  });

  it('should use pipe separator when configured', () => {
    const options = { ...defaultOptions, multilineJoin: '||' as '\\n' | '||', joinSteps: true };
    const result = transformToCSV(mockTestAnalysis, options);

    expect(result.plans[0]).toHaveProperty('steps_joined', 'Step 1||Step 2||Step 3');
  });

  it('should extract minutes from duration', () => {
    const result = transformToCSV(mockTestAnalysis, defaultOptions);

    expect(result.plans[0]).toHaveProperty('estimated_duration', '30');
  });

  it('should include coverage data', () => {
    const result = transformToCSV(mockTestAnalysis, defaultOptions);

    expect(result.plans[0]).toHaveProperty('coverage_functional', '100%');
    expect(result.plans[0]).toHaveProperty('coverage_edge', '80%');
  });

  it('should handle missing optional fields', () => {
    const minimalData: TestAnalysis = {
      casos_prueba: [
        {
          id_caso_prueba: 'TC001',
          titulo: 'Test',
          descripcion: '',
          tipo_prueba: '',
          prioridad: '',
          pasos: [],
          resultado_esperado: '',
          precondiciones: [],
          datos_prueba: {},
          potencial_automatizacion: '',
          duracion_estimada: '',
        },
      ],
    };

    const result = transformToCSV(minimalData, defaultOptions);

    expect(result.plans).toHaveLength(1);
    expect(result.plans[0]).toHaveProperty('case_id', 'TC001');
    expect(result.plans[0]).toHaveProperty('description', '');
  });

  it('should handle empty test cases array', () => {
    const emptyData: TestAnalysis = {
      casos_prueba: [],
    };

    const result = transformToCSV(emptyData, defaultOptions);

    expect(result.plans).toHaveLength(0);
    expect(result.steps).toHaveLength(0);
    expect(result.preconditions).toHaveLength(0);
    expect(result.testdata).toHaveLength(0);
  });
});
