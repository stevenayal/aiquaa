'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useToolUsage } from '@/hooks/useToolUsage';
import { TestAnalysisSchema, ExportOptions, ProcessedData } from './lib/schema';
import { transformToCSV } from './lib/transformers';
import {
  exportAllCSVs,
  downloadCSV,
  copyCsvToClipboard,
  generateFilenames,
} from './lib/csv-generator';
import JsonInputCard from './components/JsonInputCard';
import ExportOptionsCard from './components/ExportOptionsCard';
import PreviewCard from './components/PreviewCard';

const STORAGE_KEY = 'json-to-testplans-input';

export default function JsonToTestPlansPage() {
  const { logUsage, logError } = useToolUsage('json-to-testplans');
  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [options, setOptions] = useState<ExportOptions>({
    delimiter: ',',
    headerCase: 'snake_case',
    multilineJoin: '\\n',
    includeOptionalColumns: true,
    joinSteps: false,
    joinPreconditions: false,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [casesCount, setCasesCount] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setJsonInput(stored);
      }
    } catch (err) {
      console.error('Failed to load stored input:', err);
    }
  }, []);

  // Save to localStorage when input changes
  useEffect(() => {
    if (jsonInput) {
      try {
        localStorage.setItem(STORAGE_KEY, jsonInput);
      } catch (err) {
        console.error('Failed to save input:', err);
      }
    }
  }, [jsonInput]);

  const handleLoadDemo = async () => {
    try {
      const response = await fetch('/fixtures/kan-6.json');
      const data = await response.json();
      setJsonInput(JSON.stringify(data, null, 2));
      setSuccessMessage('Demo cargado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setValidationError('Error al cargar el demo: ' + (err as Error).message);
    }
  };

  const handleLoadJson = () => {
    setValidationError(null);
    setProcessedData(null);
    setCasesCount(0);

    try {
      // Parse JSON
      const parsed = JSON.parse(jsonInput);

      // Validate with Zod
      const validated = TestAnalysisSchema.parse(parsed);

      // Check if there are test cases
      if (validated.casos_prueba.length === 0) {
        setValidationError(
          'Advertencia: No se encontraron casos de prueba en el JSON'
        );
        return;
      }

      // Transform to CSV data
      const processed = transformToCSV(validated, options);
      setProcessedData(processed);
      setCasesCount(validated.casos_prueba.length);

      void logUsage('load-json');
      setSuccessMessage(
        `JSON validado exitosamente. ${validated.casos_prueba.length} casos de prueba procesados.`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formatted = err.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('\n');
        setValidationError(
          `Errores de validación:\n${formatted}\n\nRevisa que el JSON tenga la estructura correcta.`
        );
      } else if (err instanceof SyntaxError) {
        setValidationError(
          `JSON inválido: ${err.message}\n\nVerifica que el formato JSON sea correcto (comas, llaves, corchetes).`
        );
      } else {
        setValidationError('Error: ' + (err as Error).message);
      }
      void logError(err, 'load-json');
    }
  };

  const handleExport = (
    type: 'plans' | 'steps' | 'preconditions' | 'testdata'
  ) => {
    if (!processedData) return;

    const workItemKey =
      processedData.plans[0]?.work_item_key || 'AIQUAA';
    const csvs = exportAllCSVs(processedData, options);
    const filenames = generateFilenames(workItemKey);

    const csvMap = {
      plans: { csv: csvs.plans, filename: filenames.plans },
      steps: { csv: csvs.steps, filename: filenames.steps },
      preconditions: {
        csv: csvs.preconditions,
        filename: filenames.preconditions,
      },
      testdata: { csv: csvs.testdata, filename: filenames.testdata },
    };

    const selected = csvMap[type];
    downloadCSV(selected.csv, selected.filename);

    setSuccessMessage(`Archivo ${selected.filename} descargado exitosamente`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCopyToClipboard = async (
    type: 'plans' | 'steps' | 'preconditions' | 'testdata'
  ) => {
    if (!processedData) return;

    try {
      const csvs = exportAllCSVs(processedData, options);

      const csvMap = {
        plans: csvs.plans,
        steps: csvs.steps,
        preconditions: csvs.preconditions,
        testdata: csvs.testdata,
      };

      await copyCsvToClipboard(csvMap[type]);
      setSuccessMessage(`CSV de ${type} copiado al portapapeles`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setValidationError('Error al copiar al portapapeles: ' + (err as Error).message);
    }
  };

  const handleReset = () => {
    setJsonInput('');
    setProcessedData(null);
    setValidationError(null);
    setSuccessMessage(null);
    setCasesCount(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Re-process data when options change
  useEffect(() => {
    if (jsonInput && !validationError) {
      try {
        const parsed = JSON.parse(jsonInput);
        const validated = TestAnalysisSchema.parse(parsed);
        const processed = transformToCSV(validated, options);
        setProcessedData(processed);
      } catch {
        // Ignore errors when options change
      }
    }
  }, [options]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            JSON to Test Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Convierte el JSON de análisis de IA en archivos CSV listos para
            importar en herramientas de gestión de pruebas
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-300 text-sm">
              {successMessage}
            </p>
          </div>
        )}

        {/* Cases Counter */}
        {casesCount > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
              {casesCount} caso{casesCount !== 1 ? 's' : ''} de prueba procesado
              {casesCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* JSON Input */}
        <JsonInputCard
          value={jsonInput}
          onChange={setJsonInput}
          onLoadDemo={handleLoadDemo}
          error={validationError}
        />

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleLoadJson}
            disabled={!jsonInput}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Cargar y Validar JSON
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Limpiar todo
          </button>
        </div>

        {/* Export Options */}
        {processedData && (
          <>
            <ExportOptionsCard options={options} onChange={setOptions} />

            {/* Preview */}
            <PreviewCard
              data={processedData}
              onExportPlans={() => handleExport('plans')}
              onExportSteps={() => handleExport('steps')}
              onExportPreconditions={() => handleExport('preconditions')}
              onExportTestData={() => handleExport('testdata')}
              onCopyToClipboard={handleCopyToClipboard}
              joinSteps={options.joinSteps}
              joinPreconditions={options.joinPreconditions}
            />

            {/* Export All Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  handleExport('plans');
                  if (!options.joinSteps) handleExport('steps');
                  if (!options.joinPreconditions) handleExport('preconditions');
                  handleExport('testdata');
                }}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Exportar todos los CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
