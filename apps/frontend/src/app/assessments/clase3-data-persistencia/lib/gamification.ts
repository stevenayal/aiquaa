import { createAssessmentGamification } from '../../_shared/lib/gamification';

const gamification = createAssessmentGamification({
  prefix: 'CLASE3_DATA_PERSISTENCIA',
  descriptions: {
    completed: 'Completar el assessment Clase 3 Data Persistencia',
    passed: 'Aprobar el assessment Clase 3 Data Persistencia (score >= 70)',
    highScore: 'Score sobresaliente en Clase 3 Data Persistencia (>= 90)',
  },
});

export const CLASE3_DATA_PERSISTENCIA_GAMIFICATION_RULES = gamification.rules;

export const buildClase3DataPersistenciaGamificationEvents =
  gamification.buildEvents;
