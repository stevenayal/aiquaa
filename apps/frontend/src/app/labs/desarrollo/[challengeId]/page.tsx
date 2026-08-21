import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DesarrolloChallengeClient from './DesarrolloChallengeClient';
import {
  DESARROLLO_CHALLENGE_IDS,
  getDesarrolloChallenge,
} from '@/lib/labs/desarrolloChallenges';

interface PageProps {
  params: { challengeId: string };
}

export function generateStaticParams() {
  return DESARROLLO_CHALLENGE_IDS.map((challengeId) => ({ challengeId }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const challenge = getDesarrolloChallenge(params.challengeId);
  if (!challenge) return { title: 'Prueba de desarrollo | AIQUAA Labs' };

  const title = `${challenge.title} | AIQUAA Labs`;
  const description = `Prueba técnica de desarrollo (${challenge.clase}): ${challenge.objetivo}`;
  const url = `https://aiquaa.com/labs/desarrollo/${challenge.id}`;
  const og = `/api/og?title=${encodeURIComponent(challenge.title)}&subtitle=${encodeURIComponent(
    `${challenge.clase} - Prueba de desarrollo`
  )}&section=Labs`;

  return {
    title,
    description,
    keywords: [
      'prueba técnica de desarrollo',
      'entrega por repositorio',
      challenge.clase,
      challenge.title,
      'bootcamp',
      'AIQUAA',
      'evaluación técnica',
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: 'AIQUAA',
      type: 'website',
      locale: 'es_PY',
      images: [
        {
          url: og,
          width: 1200,
          height: 630,
          alt: `${challenge.title} - AIQUAA`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og],
      creator: '@stevenayal',
    },
    alternates: { canonical: url },
  };
}

export default function DesarrolloChallengePage({ params }: PageProps) {
  const challenge = getDesarrolloChallenge(params.challengeId);
  if (!challenge) notFound();

  return <DesarrolloChallengeClient challenge={challenge} />;
}
