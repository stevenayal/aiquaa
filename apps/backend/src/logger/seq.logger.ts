// apps/backend/src/logger/seq.logger.ts
import pino, { Logger, TransportSingleOptions } from 'pino';

/**
 * Crea un logger Pino que envía a Seq si hay configuración.
 * No importamos directamente 'pino-seq' para evitar issues ESM/CJS:
 * dejamos que pino resuelva el target por nombre ('pino-seq').
 */
export function createSeqLogger(): Logger {
  const level = process.env.LOG_LEVEL || 'info';
  const useSeq = Boolean(process.env.SEQ_URL);

  if (!useSeq) {
    return pino({
      level,
      base: { service: 'aiquaa-backend' },
      formatters: { level: (l) => ({ level: l.toUpperCase() }) },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  try {
    // Pino resuelve el paquete 'pino-seq' internamente.
    const transport: TransportSingleOptions = {
      target: 'pino-seq',
      options: {
        serverUrl: process.env.SEQ_URL,
        apiKey: process.env.SEQ_API_KEY,
        level, // nivel mínimo que enviamos a Seq
      },
    };

    // Nota: si 'pino-seq' no está instalado o hay problema ESM,
    // Pino lanzará excepción que capturamos abajo -> fallback local.
    const stream = pino.transport(transport);
    return pino({
      level,
      base: { service: 'aiquaa-backend' },
      formatters: { level: (l) => ({ level: l.toUpperCase() }) },
      timestamp: pino.stdTimeFunctions.isoTime,
    }, stream);
  } catch (e: unknown) {
    const err = e as Error;
    // Fallback seguro: log local sin romper el build ni el arranque.
    // Evita acceder a .message en unknown.
    // eslint-disable-next-line no-console
    console.error(
      'Seq transport failed, falling back to local pino:',
      err?.message ?? e
    );
    return pino({
      level,
      base: { service: 'aiquaa-backend' },
      formatters: { level: (l) => ({ level: l.toUpperCase() }) },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }
}

// Create logger instance
export const logger = createSeqLogger();


