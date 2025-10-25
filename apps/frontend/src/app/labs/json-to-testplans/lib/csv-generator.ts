import Papa from 'papaparse';
import { ProcessedData, ExportOptions } from './schema';
import { convertHeaderCase, generateFilename } from './utils';

/**
 * Generate CSV string from processed data
 */
export function generateCSV(
  data: Array<Record<string, any>>,
  options: ExportOptions
): string {
  if (data.length === 0) {
    return '';
  }

  // Convert headers to desired case
  const headers = Object.keys(data[0]);
  const convertedHeaders = headers.map((h) =>
    convertHeaderCase(h, options.headerCase)
  );

  // Convert data rows with converted headers
  const rows = data.map((row) => {
    const newRow: Record<string, any> = {};
    headers.forEach((header, index) => {
      newRow[convertedHeaders[index]] = row[header] || '';
    });
    return newRow;
  });

  // Generate CSV with papaparse
  const csv = Papa.unparse(rows, {
    delimiter: options.delimiter,
    header: true,
    skipEmptyLines: false,
  });

  // Add UTF-8 BOM for Excel compatibility
  return '\uFEFF' + csv;
}

/**
 * Download CSV file
 */
export function downloadCSV(
  csvContent: string,
  filename: string
): void {
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy CSV to clipboard
 */
export async function copyCsvToClipboard(csvContent: string): Promise<void> {
  await navigator.clipboard.writeText(csvContent);
}

/**
 * Export all CSVs from processed data
 */
export function exportAllCSVs(
  processedData: ProcessedData,
  options: ExportOptions
): {
  plans: string;
  steps: string;
  preconditions: string;
  testdata: string;
} {
  return {
    plans: generateCSV(processedData.plans, options),
    steps: generateCSV(
      processedData.steps.map((s) => ({
        case_id: s.case_id,
        step_number: s.step_number,
        step_text: s.step_text,
      })),
      options
    ),
    preconditions: generateCSV(
      processedData.preconditions.map((p) => ({
        case_id: p.case_id,
        precondition_number: p.precondition_number,
        precondition_text: p.precondition_text,
      })),
      options
    ),
    testdata: generateCSV(
      processedData.testdata.map((t) => ({
        case_id: t.case_id,
        key: t.key,
        value: t.value,
      })),
      options
    ),
  };
}

/**
 * Generate all filenames
 */
export function generateFilenames(workItemKey?: string): {
  plans: string;
  steps: string;
  preconditions: string;
  testdata: string;
} {
  return {
    plans: generateFilename('plans', workItemKey),
    steps: generateFilename('steps', workItemKey),
    preconditions: generateFilename('preconditions', workItemKey),
    testdata: generateFilename('testdata', workItemKey),
  };
}
