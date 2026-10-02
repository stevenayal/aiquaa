import type { ExamData } from './types';

import questionsModelA from './data/questions-modelo-a.json';
import questionsEnModelA from './data/questions-en-model-a.json';
import questionsEnModelB from './data/questions-en-model-b.json';
import questionsEnModelC from './data/questions-en-model-c.json';
import questionsEsModelB from './data/questions-es-model-b.json';
import questionsEsModelC from './data/questions-es-model-c.json';

// SEC-HIGH (#225): este módulo importa el banco de preguntas completo
// (con `correctAnswer`/`explanations`). SOLO debe importarse desde código
// que corre en el servidor (server actions, `src/actions/lib/*`). Si algún
// componente 'use client' llega a importarlo (directa o transitivamente),
// Next.js volverá a empaquetar las respuestas correctas en el JS que se
// envía al navegador antes de que el usuario responda.
export function loadExamData(examId: string = 'es-model-a'): ExamData {
  switch (examId) {
    case 'es-model-a':
      return questionsModelA as unknown as ExamData;
    case 'es-model-b':
      return questionsEsModelB as unknown as ExamData;
    case 'es-model-c':
      return questionsEsModelC as unknown as ExamData;
    case 'en-model-a':
      return questionsEnModelA as unknown as ExamData;
    case 'en-model-b':
      return questionsEnModelB as unknown as ExamData;
    case 'en-model-c':
      return questionsEnModelC as unknown as ExamData;
    default:
      return questionsModelA as unknown as ExamData;
  }
}
