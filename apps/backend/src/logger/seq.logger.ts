import pino from 'pino';

const transport = pino.transport({
  target: 'pino-seq',
  options: {
    serverUrl: process.env.SEQ_URL || 'http://seq.railway.internal:5341',
    apiKey: process.env.SEQ_API_KEY || '',
    onError: (e: Error) => {
      // Evitar tirar el proceso por errores de red a Seq
      // eslint-disable-next-line no-console
      console.error('Seq transport error:', e.message);
    },
  },
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: { service: 'aiquaa-backend' },
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);


