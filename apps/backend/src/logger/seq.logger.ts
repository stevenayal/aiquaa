import pino from 'pino';

// Dynamic import for ESM module
let pinoSeq: any;
let seqStream: any;

// Initialize the logger with dynamic import
const initializeLogger = async () => {
  if (!pinoSeq) {
    pinoSeq = await import('pino-seq');
  }

  if (!seqStream) {
    seqStream = pinoSeq.default.createStream({
      serverUrl: process.env.SEQ_URL || 'http://seq.railway.internal:5341',
      apiKey: process.env.SEQ_API_KEY || '',
      // Importante: firma correcta: SOLO (e: Error)
      onError: (e: Error) => {
        // no tumbar el proceso si falla el envío
        // eslint-disable-next-line no-console
        console.error('Seq stream error:', e.message);
      },
    });
  }

  return pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      base: { service: 'aiquaa-backend' },
      formatters: { level: (l) => ({ level: l.toUpperCase() }) },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    seqStream,
  );
};

// Create a fallback logger that will be replaced once the ESM module is loaded
let logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'aiquaa-backend' },
  formatters: { level: (l) => ({ level: l.toUpperCase() }) },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Initialize the logger asynchronously
initializeLogger().then((seqLogger) => {
  logger = seqLogger;
}).catch((error) => {
  console.error('Failed to initialize Seq logger, using fallback:', error.message);
});

export { logger };


