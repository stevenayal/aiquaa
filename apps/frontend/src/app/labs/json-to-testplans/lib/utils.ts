/**
 * Normalize text: trim and collapse multiple spaces
 */
export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Extract minutes from duration string
 * Examples: "30 min" -> "30", "1h" -> "60", "1.5 hours" -> "90"
 */
export function extractMinutes(duration: string): string {
  if (!duration) return '';

  const normalized = duration.toLowerCase().trim();

  // Match patterns like "30 min", "30min", "30 minutes"
  const minMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:min|minutos?)/);
  if (minMatch) {
    return String(Math.round(parseFloat(minMatch[1])));
  }

  // Match patterns like "1h", "1 hour", "1.5 hours"
  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:h|hour|hora)s?/);
  if (hourMatch) {
    return String(Math.round(parseFloat(hourMatch[1]) * 60));
  }

  // Match just numbers
  const numMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    return String(Math.round(parseFloat(numMatch[1])));
  }

  return '';
}

/**
 * Flatten an object one level deep
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix = ''
): Record<string, any> {
  const result: Record<string, any> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Flatten one level
      Object.entries(value).forEach(([subKey, subValue]) => {
        result[`${newKey}.${subKey}`] = subValue;
      });
    } else if (Array.isArray(value)) {
      result[newKey] = value.join(', ');
    } else {
      result[newKey] = value;
    }
  });

  return result;
}

/**
 * Convert header to specified case
 */
export function convertHeaderCase(
  header: string,
  caseType: 'snake_case' | 'camelCase' | 'Title Case'
): string {
  if (caseType === 'snake_case') {
    return header;
  }

  if (caseType === 'camelCase') {
    return header
      .split('_')
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  }

  // Title Case
  return header
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  prefix: string,
  workItemKey?: string
): string {
  const key = workItemKey || 'AIQUAA';
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('');

  return `${prefix}_${key}_${timestamp}.csv`;
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
export function escapeCsvValue(value: string, delimiter: ',' | ';'): string {
  if (!value) return '';

  // Check if escaping is needed
  const needsEscaping =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');

  if (needsEscaping) {
    // Escape double quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return value;
}
