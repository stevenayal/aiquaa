import pino from 'pino';
import buildSeq from 'pino-seq';

const seqStream = buildSeq({
  serverUrl: process.env.SEQ_URL || 'http://seq.railway.internal:5341',
  apiKey: process.env.SEQ_API_KEY || '',
  // Importante: firma correcta: SOLO (e: Error)
  onError: (e: Error) => {
    // no tumbar el proceso si falla el envío
    // eslint-disable-next-line no-console
    console.error('Seq stream error:', e.message);
  },
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: { service: 'aiquaa-backend' },
    formatters: { level: (l) => ({ level: l.toUpperCase() }) },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  seqStream,
);


