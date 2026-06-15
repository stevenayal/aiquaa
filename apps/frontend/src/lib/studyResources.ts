// Central catalog of study resources (downloadable PDFs).
// Single source of truth shared by the /recursos page and the home page stats,
// so the "recursos de estudio" counter always reflects the real catalog.

export interface StudyResource {
  id: string;
  title: string;
  description: string;
  filename: string;
  pages: number;
  lastUpdated: string;
  featured?: boolean;
  isNew?: boolean;
  category: 'git' | 'performance' | 'testing' | 'automation';
}

export const studyResources: StudyResource[] = [
  // Git Resources
  {
    id: 'git-intro',
    title: 'Introducción a GIT',
    description:
      'Guía completa para principiantes sobre control de versiones con Git. Incluye comandos básicos, flujos de trabajo y buenas prácticas.',
    filename: 'resources/git/Introduccion-a-GIT.pdf',
    pages: 45,
    lastUpdated: '2025-01-15',
    featured: true,
    category: 'git',
  },

  // Performance Testing Resources
  {
    id: 'jmeter-syllabus-es',
    title: 'PtU JMeter - Programa de Estudio (Español)',
    description:
      'Syllabus oficial de la certificación PtU Certified Performance Tester with JMeter. Versión en español con todos los tópicos del examen.',
    filename:
      'resources/performance/PtU_Certified_Performance_Tester_with_JMeter_Syllabus_SPN_Ver.1.1.pdf',
    pages: 28,
    lastUpdated: '2024-12-10',
    featured: true,
    category: 'performance',
  },
  {
    id: 'jmeter-syllabus-en',
    title: 'PtU JMeter - Syllabus (English)',
    description:
      'Official PtU Certified Performance Tester with JMeter syllabus. English version covering all exam topics and learning objectives.',
    filename:
      'resources/performance/PtU_Certified_Performance_Tester_with_JMeter_Syllabus_ENG_Ver.1.1.pdf',
    pages: 28,
    lastUpdated: '2024-12-10',
    category: 'performance',
  },
  {
    id: 'jmeter-sample-exam',
    title: 'PtU JMeter - Examen de Muestra',
    description:
      'Examen de práctica oficial para la certificación PtU JMeter. Ideal para prepararse y conocer el formato del examen real.',
    filename: 'resources/performance/PtU_sample_exam.pdf',
    pages: 12,
    lastUpdated: '2024-12-10',
    isNew: true,
    category: 'performance',
  },

  // ISTQB Resources
  {
    id: 'istqb-syllabus',
    title: 'ISTQB CTFL v4.0 - Programa de Estudio',
    description:
      'Programa oficial de estudios ISTQB Certified Tester Foundation Level v4.0 en español. Material completo para preparar la certificación.',
    filename: 'resources/istqb/CTFL-v4.0-ES-Programa-de-Estudio.pdf',
    pages: 97,
    lastUpdated: '2024-11-20',
    featured: true,
    category: 'testing',
  },
  {
    id: 'istqb-exam-a-questions',
    title: 'ISTQB CTFL v4.0 - Examen Modelo A (Preguntas)',
    description:
      'Examen de muestra oficial ISTQB CTFL v4.0 Modelo A. Preguntas de práctica en español para preparar tu certificación.',
    filename: 'resources/istqb/CTFL-v4.0-ES-Examen-A-Preguntas.pdf',
    pages: 15,
    lastUpdated: '2024-11-20',
    isNew: true,
    category: 'testing',
  },
  {
    id: 'istqb-exam-a-answers',
    title: 'ISTQB CTFL v4.0 - Examen Modelo A (Respuestas)',
    description:
      'Respuestas y justificaciones del examen de muestra ISTQB CTFL v4.0 Modelo A. Incluye explicaciones detalladas.',
    filename: 'resources/istqb/CTFL-v4.0-ES-Examen-A-Respuestas.pdf',
    pages: 12,
    lastUpdated: '2024-11-20',
    category: 'testing',
  },
  {
    id: 'istqb-exam-b-questions',
    title: 'ISTQB CTFL v4.0 - Examen Modelo B (Preguntas)',
    description:
      'Examen de muestra oficial ISTQB CTFL v4.0 Modelo B. Segundo set de preguntas de práctica para fortalecer tu preparación.',
    filename: 'resources/istqb/CTFL-v4.0-ES-Examen-B-Preguntas.pdf',
    pages: 15,
    lastUpdated: '2024-11-20',
    isNew: true,
    category: 'testing',
  },
  {
    id: 'istqb-exam-b-answers',
    title: 'ISTQB CTFL v4.0 - Examen Modelo B (Respuestas)',
    description:
      'Respuestas y justificaciones del examen de muestra ISTQB CTFL v4.0 Modelo B con explicaciones completas.',
    filename: 'resources/istqb/CTFL-v4.0-ES-Examen-B-Respuestas.pdf',
    pages: 12,
    lastUpdated: '2024-11-20',
    category: 'testing',
  },
];

/** Total number of study resources — real count for the home hero stat. */
export const STUDY_RESOURCE_COUNT = studyResources.length;
