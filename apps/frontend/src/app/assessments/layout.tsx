import type { Metadata } from 'next';
import ExamAuthGate from '@/components/labs/ExamAuthGate';

export const metadata: Metadata = {
  title: 'AIQUAA Assessments - Evaluaciones Técnicas QA',
  description:
    'Evaluaciones técnicas prácticas para QA, testing y criterios de producto dentro de AIQUAA.',
  openGraph: {
    title: 'AIQUAA Assessments',
    description:
      'Challenges progresivos para validar criterio QA, diseño de pruebas y análisis técnico.',
  },
};

export default function AssessmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ExamAuthGate examName="AIQUAA Assessments" examEmoji="🧪">
      {children}
    </ExamAuthGate>
  );
}
