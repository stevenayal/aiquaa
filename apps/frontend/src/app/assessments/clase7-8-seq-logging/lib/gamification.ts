import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'CLASE7_8_SEQ_LOGGING',
  descriptions: {
    completed: 'Completar el assessment Clases 7 y 8 SEQ Structured Logging',
    passed:
      'Aprobar el assessment Clases 7 y 8 SEQ Structured Logging (score >= 70)',
    highScore:
      'Score sobresaliente en Clases 7 y 8 SEQ Structured Logging (>= 90)',
  },
});

export const CLASE7_8_SEQ_LOGGING_GAMIFICATION_RULES = gamification.rules;

export const buildClase78SeqLoggingGamificationEvents =
  gamification.buildEvents;
