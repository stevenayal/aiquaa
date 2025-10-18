import { PairwiseResult, CsvExportOptions } from './types';

/**
 * Default CSV export options
 */
const DEFAULT_CSV_OPTIONS: Required<CsvExportOptions> = {
  includeCounter: true,
  counterLabel: '#',
  delimiter: ',',
};

/**
 * Escape a CSV value if it contains special characters
 */
function escapeCsvValue(value: string, delimiter: string): string {
  // If value contains delimiter, quotes, or newlines, wrap in quotes and escape quotes
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert pairwise result to CSV string
 *
 * @param result - The pairwise result to export
 * @param options - Export options
 * @returns CSV string
 */
export function toCsv(result: PairwiseResult, options: CsvExportOptions = {}): string {
  const opts = { ...DEFAULT_CSV_OPTIONS, ...options };
  const lines: string[] = [];

  // Build header row
  const headerRow: string[] = [];
  if (opts.includeCounter) {
    headerRow.push(escapeCsvValue(opts.counterLabel, opts.delimiter));
  }
  headerRow.push(...result.headers.map((h) => escapeCsvValue(h, opts.delimiter)));
  lines.push(headerRow.join(opts.delimiter));

  // Build data rows
  result.rows.forEach((row, index) => {
    const dataRow: string[] = [];
    if (opts.includeCounter) {
      dataRow.push(String(index + 1));
    }
    dataRow.push(...row.map((v) => escapeCsvValue(v, opts.delimiter)));
    lines.push(dataRow.join(opts.delimiter));
  });

  return lines.join('\n');
}

/**
 * Parse CSV string to get parameters
 * Assumes first row is headers, subsequent rows are values
 * Each column becomes a parameter with unique values
 *
 * @param csvText - CSV string to parse
 * @param options - Parse options
 * @returns Parsed labels and parameters
 */
export function fromCsv(
  csvText: string,
  options: { delimiter?: string; hasCounter?: boolean } = {}
): { labels: string[]; parameters: string[][] } {
  const delimiter = options.delimiter || ',';
  const hasCounter = options.hasCounter ?? false;

  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error('CSV is empty');
  }

  // Simple CSV parser (doesn't handle complex escaping)
  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quotes
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return values;
  };

  // Parse header
  const headers = parseRow(lines[0]);
  const startCol = hasCounter ? 1 : 0;
  const labels = headers.slice(startCol);

  // Parse values
  const valuesByColumn: Set<string>[] = labels.map(() => new Set<string>());

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    const values = row.slice(startCol);

    values.forEach((value, colIndex) => {
      if (colIndex < valuesByColumn.length && value.length > 0) {
        valuesByColumn[colIndex].add(value);
      }
    });
  }

  const parameters = valuesByColumn.map((set) => Array.from(set));

  return { labels, parameters };
}
