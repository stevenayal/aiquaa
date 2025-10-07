import pino from 'pino';
import build from 'pino-seq';

const seqStream = build({
  serverUrl: process.env.SEQ_URL || 'http://seq.railway.internal:5341',
  apiKey: process.env.SEQ_API_KEY || '',
  onError: (err, evt) => {
    // Se usa console.error como fallback para no perder el error del transporte
    // eslint-disable-next-line no-console
    console.error('Error enviando a Seq:', err, evt);
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
  seqStream,
);


