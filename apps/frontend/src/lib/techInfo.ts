import type { TechnicalInfo } from '@/types/bug';

/**
 * Collects technical information from the browser environment
 */
export function collectTechnicalInfo(): TechnicalInfo {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // @ts-ignore - deviceMemory is experimental
  const deviceMemory = navigator.deviceMemory;

  return {
    url: window.location.href,
    referrer: document.referrer || 'Direct',
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport,
    deviceMemory: deviceMemory ? Number(deviceMemory) : undefined,
    platform: navigator.platform,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Console log interceptor for capturing errors and warnings
 */
export class ConsoleLogCapture {
  private logs: string[] = [];
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private isCapturing = false;
  private timeoutId?: NodeJS.Timeout;

  constructor() {
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  /**
   * Start capturing console logs for a specified duration
   */
  start(durationMs: number = 30000): void {
    if (this.isCapturing) {
      return;
    }

    this.isCapturing = true;
    this.logs = [];

    // Override console methods
    console.error = (...args: unknown[]) => {
      this.logs.push(`[ERROR] ${new Date().toISOString()}: ${this.formatArgs(args)}`);
      this.originalConsoleError.apply(console, args);
    };

    console.warn = (...args: unknown[]) => {
      this.logs.push(`[WARN] ${new Date().toISOString()}: ${this.formatArgs(args)}`);
      this.originalConsoleWarn.apply(console, args);
    };

    // Auto-stop after duration
    this.timeoutId = setTimeout(() => {
      this.stop();
    }, durationMs);
  }

  /**
   * Stop capturing and restore original console methods
   */
  stop(): void {
    if (!this.isCapturing) {
      return;
    }

    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    this.isCapturing = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  /**
   * Get captured logs
   */
  getLogs(): string[] {
    return [...this.logs];
  }

  /**
   * Clear captured logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Format console arguments to string
   */
  private formatArgs(args: unknown[]): string {
    return args
      .map((arg) => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}\n${arg.stack}`;
        }
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');
  }
}

/**
 * Create a blob file from console logs
 */
export function createConsoleLogsFile(logs: string[]): File {
  const content = logs.join('\n\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return new File([blob], `console-logs-${timestamp}.txt`, { type: 'text/plain' });
}
