import { Metadata } from 'next';
import { clase3DataPersistenciaDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export const metadata: Metadata = {
  title: 'Clase 3 — Data Persistencia | AIQUAA',
  description:
    'Prueba técnica teórica sobre persistencia de datos: ADO.NET vs Entity Framework Core, migraciones, PostgreSQL/Npgsql, DTOs y FluentValidation.',
  keywords: [
    'persistencia de datos',
    'Entity Framework Core',
    'ADO.NET',
    'PostgreSQL',
    'Npgsql',
    'migraciones',
    'DTOs',
    'FluentValidation',
    'bootcamp',
    'AIQUAA',
  ],
  openGraph: {
    title: 'Clase 3 — Data Persistencia | AIQUAA',
    description:
      'Prueba técnica teórica sobre persistencia de datos: ADO.NET vs Entity Framework Core, migraciones, PostgreSQL/Npgsql, DTOs y FluentValidation.',
    url: 'https://aiquaa.com/assessments/clase3-data-persistencia',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=Clase%203%20-%20Data%20Persistencia&subtitle=Persistencia%2C%20EF%20Core%20y%20PostgreSQL&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'Clase 3 — Data Persistencia - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clase 3 — Data Persistencia | AIQUAA',
    description:
      'Prueba técnica teórica sobre persistencia de datos: ADO.NET vs Entity Framework Core, migraciones, PostgreSQL/Npgsql, DTOs y FluentValidation.',
    images: [
      '/api/og?title=Clase%203%20-%20Data%20Persistencia&subtitle=Persistencia%2C%20EF%20Core%20y%20PostgreSQL&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/clase3-data-persistencia',
  },
};

export default function Clase3DataPersistenciaPage() {
  const overview = {
    assessment: {
      id: 'static-clase3-data-persistencia',
      slug: clase3DataPersistenciaDefinition.slug,
      title: clase3DataPersistenciaDefinition.title,
      description: clase3DataPersistenciaDefinition.description,
      level: clase3DataPersistenciaDefinition.level,
      type: clase3DataPersistenciaDefinition.type,
      duration_minutes: clase3DataPersistenciaDefinition.duration_minutes,
      total_score: clase3DataPersistenciaDefinition.total_score,
      is_active: clase3DataPersistenciaDefinition.is_active,
      metadata: clase3DataPersistenciaDefinition.metadata,
    },
    sections: clase3DataPersistenciaDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-clase3-data-persistencia',
        slug: section.slug,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        max_score: section.max_score,
        metadata: section.metadata,
      })
    ),
  };

  return (
    <AssessmentWelcome
      overview={overview}
      startHref="/assessments/clase3-data-persistencia/start"
      evaluatesCopy={
        'Qué significa que un dato persista; el contraste entre el acceso directo de ADO.NET y el mapeo objeto-relacional de Entity Framework Core; seguridad integrada y migraciones de EF Core; PostgreSQL con Npgsql y connection pooling; despliegue en contenedor con credenciales por variables de entorno; el rol de los DTOs frente a las entidades de dominio; y la definición de reglas con FluentValidation.'
      }
      scoringCopy="Automático en las 3 secciones: 9 preguntas de respuesta única y 1 de varias respuestas, con crédito parcial."
      resultCopy="Score total, score por sección, fortalezas, debilidades y temas a reforzar."
    />
  );
}
