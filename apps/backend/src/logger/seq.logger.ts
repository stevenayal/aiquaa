import pino from 'pino';

export async function createSeqLogger() {
  // Check if Seq configuration is available
  if (!process.env.SEQ_URL && !process.env.SEQ_API_KEY) {
    console.warn('Seq configuration not found, using basic logger');
    return pino({
      level: process.env.LOG_LEVEL || 'info',
      base: { service: 'aiquaa-backend' },
      formatters: { level: (l) => ({ level: l.toUpperCase() }) },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  try {
    // Use dynamic import for ESM module
    const { default: pinoSeq } = await import('pino-seq');

    const transport = pino.transport({
      target: pinoSeq,
      options: {
        serverUrl: process.env.SEQ_URL,
        apiKey: process.env.SEQ_API_KEY,
        level: process.env.LOG_LEVEL || 'info',
        onError: (e: Error) => {
          console.error('Seq stream error:', e.message);
        },
      },
    });

    return pino({
      level: process.env.LOG_LEVEL || 'info',
      base: { service: 'aiquaa-backend' },
      formatters: { level: (l) => ({ level: l.toUpperCase() }) },
      timestamp: pino.stdTimeFunctions.isoTime,
    }, transport);
  } catch (error) {
    console.error('Failed to initialize Seq logger, using fallback:', error.message);
    return pino({
      level: process.env.LOG_LEVEL || 'info',
      base: { service: 'aiquaa-backend' },
      formatters: { level: (l) => ({ level: l.toUpperCase() }) },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }
}

// Create a fallback logger that will be replaced once the ESM module is loaded
let logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'aiquaa-backend' },
  formatters: { level: (l) => ({ level: l.toUpperCase() }) },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Initialize the logger asynchronously
createSeqLogger().then((seqLogger) => {
  logger = seqLogger;
}).catch((error) => {
  console.error('Failed to initialize Seq logger, using fallback:', error.message);
});

export { logger };


