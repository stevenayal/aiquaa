import { Metadata } from 'next';
import { PY_TESTING_FEST_2026 as EVENT } from '@/lib/events/py-testing-fest-2026';
import PyTestingFestClient from './PyTestingFestClient';

const canonical = `https://aiquaa.com${EVENT.href}`;
const description = `${EVENT.dateLabel} en ${EVENT.venue}. Seis charlas sobre IA, automatización, performance, seguridad ofensiva y videojuegos. Entrada libre y gratuita.`;
const ogImage =
  '/api/og?title=PY%20Testing%20Fest%202026&subtitle=26%20de%20septiembre%20·%20Hotel%20Sheraton%2C%20Asunción&section=Eventos';

export const metadata: Metadata = {
  title: 'PY Testing Fest 2026',
  description,
  keywords: [
    'PY Testing Fest',
    'PY Testing Fest 2026',
    'evento QA Paraguay',
    'testing Paraguay',
    'conferencia de testing',
    'PY Testing Community',
    'Asunción',
    'QA',
    'AIQUAA',
  ],
  openGraph: {
    title: 'PY Testing Fest 2026 | AIQUAA',
    description,
    url: canonical,
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'PY Testing Fest 2026 - 26 de septiembre, Hotel Sheraton, Asunción',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PY Testing Fest 2026 | AIQUAA',
    description,
    images: [ogImage],
    creator: '@stevenayal',
  },
  alternates: {
    canonical,
  },
};

const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: EVENT.title,
  description,
  startDate: EVENT.startsAt,
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  url: canonical,
  location: {
    '@type': 'Place',
    name: EVENT.venue,
    address: {
      '@type': 'PostalAddress',
      addressLocality: EVENT.city,
      addressCountry: 'PY',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: EVENT.organizer,
    email: EVENT.contactEmail,
  },
  offers: {
    '@type': 'Offer',
    price: 0,
    priceCurrency: 'PYG',
    availability: 'https://schema.org/InStock',
    url: EVENT.registrationUrl,
  },
  performer: EVENT.speakers.map((speaker) => ({
    '@type': 'Person',
    name: speaker.name,
    affiliation: speaker.company,
  })),
};

export default function PyTestingFest2026Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <PyTestingFestClient />
    </>
  );
}
