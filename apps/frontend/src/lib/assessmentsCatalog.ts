// Catalogo central de assessments.
//
// Fuente unica de verdad, igual que labsCatalog.ts para /labs. Antes el indice
// tenia las 18 definiciones importadas a mano junto con su estilo (badge, color
// de acento, clase del boton) en un array de 130 lineas dentro del componente:
// agregar un assessment obligaba a tocar la pagina, y tres de ellos se habian
// quedado afuera del catalogo sin que nada lo delatara.
//
// Los datos de cada evaluacion (titulo, descripcion, nivel, duracion, puntaje)
// NO se repiten aca: se leen de su propia definicion, que es lo que ademas
// alimenta el seed y el scoring.

import type { AssessmentSeedDefinition } from '@/app/assessments/_shared/types';

import { apiDeveloperFundamentalsDefinition } from '@/app/assessments/api-developer-fundamentals/data/assessment-definition';
import { apiDotnetFundamentalsDefinition } from '@/app/assessments/api-dotnet-fundamentals/data/assessment-definition';
import { apiTestingFundamentalsDefinition } from '@/app/assessments/api-testing-fundamentals/data/assessment-definition';
import { cicdFundamentalsDefinition } from '@/app/assessments/cicd-fundamentals/data/assessment-definition';
import { clase3DataPersistenciaDefinition } from '@/app/assessments/clase3-data-persistencia/data/assessment-definition';
import { clase5KubernetesDefinition } from '@/app/assessments/clase5-kubernetes/data/assessment-definition';
import { clase6ConfigKubernetesDefinition } from '@/app/assessments/clase6-config-kubernetes/data/assessment-definition';
import { clase78SeqLoggingDefinition } from '@/app/assessments/clase7-8-seq-logging/data/assessment-definition';
import { clase9CicdGithubActionsDefinition } from '@/app/assessments/clase9-cicd-github-actions/data/assessment-definition';
import { databaseFundamentalsDefinition } from '@/app/assessments/database-fundamentals/data/assessment-definition';
import { databasePracticeDefinition } from '@/app/assessments/database-practice/data/assessment-definition';
import { dockerFundamentalsDefinition } from '@/app/assessments/docker-fundamentals/data/assessment-definition';
import { gherkinFundamentalsDefinition } from '@/app/assessments/gherkin-fundamentals/data/assessment-definition';
import { infrastructureFundamentalsDefinition } from '@/app/assessments/infrastructure-fundamentals/data/assessment-definition';
import { kubernetesHelmFundamentalsDefinition } from '@/app/assessments/kubernetes-helm-fundamentals/data/assessment-definition';
import { observabilityFundamentalsDefinition } from '@/app/assessments/observability-fundamentals/data/assessment-definition';
import { playwrightFundamentalsDefinition } from '@/app/assessments/playwright-fundamentals/data/assessment-definition';

export interface AssessmentEntry {
  definition: AssessmentSeedDefinition;
  icon: string;
  /** Se muestran primero, en su propia franja. */
  featured?: boolean;
}

export interface AssessmentCategory {
  id: string;
  name: string;
  description: string;
  assessments: AssessmentEntry[];
}

export const assessmentCategories: AssessmentCategory[] = [
  {
    id: 'qa-testing',
    name: '🧪 QA y Testing',
    description:
      'Criterio de testing aplicado: contratos de API, automatización, BDD y datos',
    assessments: [
      {
        definition: apiTestingFundamentalsDefinition,
        icon: '🔌',
        featured: true,
      },
      {
        definition: playwrightFundamentalsDefinition,
        icon: '🎭',
        featured: true,
      },
      { definition: databasePracticeDefinition, icon: '🗄️', featured: true },
      { definition: gherkinFundamentalsDefinition, icon: '🥒' },
      { definition: databaseFundamentalsDefinition, icon: '🗃️' },
      { definition: infrastructureFundamentalsDefinition, icon: '🧰' },
    ],
  },
  {
    id: 'devops',
    name: '⚙️ DevOps e Infraestructura',
    description:
      'Contenedores, orquestación, integración continua y observabilidad',
    assessments: [
      { definition: dockerFundamentalsDefinition, icon: '🐳' },
      { definition: cicdFundamentalsDefinition, icon: '🔁' },
      { definition: kubernetesHelmFundamentalsDefinition, icon: '☸️' },
      { definition: observabilityFundamentalsDefinition, icon: '📈' },
    ],
  },
  {
    id: 'backend-apis',
    name: '🧩 Desarrollo backend y APIs',
    description: 'Diseño de APIs REST y fundamentos de backend',
    assessments: [
      { definition: apiDeveloperFundamentalsDefinition, icon: '🛠️' },
      { definition: apiDotnetFundamentalsDefinition, icon: '🟣' },
    ],
  },
  {
    id: 'bootcamp',
    name: '🎓 Bootcamp — clases',
    description:
      'Evaluaciones cortas atadas a las clases del bootcamp, en orden',
    assessments: [
      { definition: clase3DataPersistenciaDefinition, icon: '3️⃣' },
      { definition: clase5KubernetesDefinition, icon: '5️⃣' },
      { definition: clase6ConfigKubernetesDefinition, icon: '6️⃣' },
      { definition: clase78SeqLoggingDefinition, icon: '7️⃣' },
      { definition: clase9CicdGithubActionsDefinition, icon: '9️⃣' },
    ],
  },
];

/** Todas las evaluaciones, aplanadas. */
export const allAssessments: AssessmentEntry[] = assessmentCategories.flatMap(
  (category) => category.assessments
);

export const featuredAssessments: AssessmentEntry[] = allAssessments.filter(
  (entry) => entry.featured
);

export const assessmentCount = allAssessments.length;
