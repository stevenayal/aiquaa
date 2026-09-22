/**
 * Fuente única de datos del PY Testing Fest 2026.
 *
 * La usan la landing (`/eventos/py-testing-fest-2026`) y el slide promocional
 * del carrusel de la home, para que fecha, título y link de inscripción no se
 * dupliquen.
 */

export interface EventSpeaker {
  id: string;
  /** Orden de la charla en el programa (1..6). */
  order: number;
  name: string;
  company: string;
  country: string;
  talk: string;
  abstract: string;
  image: string;
  imageAlt: string;
}

const IMAGE_BASE = '/images/eventos/py-testing-fest-2026';

const SPEAKERS: EventSpeaker[] = [
  {
    id: 'alfonsina-morgavi',
    order: 1,
    name: 'Alfonsina Morgavi',
    company: 'Qactions',
    country: 'Argentina',
    talk: 'Detrás de cada robot que falló, faltaron pruebas para ese escenario',
    abstract:
      'Casi cinco décadas de incidentes documentados y una especialidad que recién se está escribiendo.',
    image: `${IMAGE_BASE}/alfonsina-automatizacion.jpg`,
    imageAlt:
      'Alfonsina Morgavi (Qactions, Argentina) — Detrás de cada robot que falló, faltaron pruebas para ese escenario',
  },
  {
    id: 'german-hellweg',
    order: 2,
    name: 'German Hellweg',
    company: 'Forty AU',
    country: 'Paraguay',
    talk: 'El agente no adivina: automatización asistida por IA sin perder el control',
    abstract:
      'Cómo lograr que un agente genere pruebas a partir de comportamientos documentados, sin improvisar.',
    image: `${IMAGE_BASE}/german-automatizacion.jpg`,
    imageAlt:
      'German Hellweg (Forty AU, Paraguay) — El agente no adivina: automatización asistida por IA sin perder el control',
  },
  {
    id: 'patricia-osorio',
    order: 3,
    name: 'Patricia Osorio',
    company: 'IT Alianza',
    country: 'Colombia',
    talk: 'IA bajo sospecha: evaluar las respuestas de la IA antes de convertirlas en pruebas',
    abstract:
      'Cómo sospechar de una respuesta que se ve completa y rescatar lo que la IA asumió sola.',
    image: `${IMAGE_BASE}/patricia-ia-riesgos.jpg`,
    imageAlt:
      'Patricia Osorio (IT Alianza, Colombia) — IA bajo sospecha: evaluar las respuestas de la IA antes de convertirlas en pruebas',
  },
  {
    id: 'eliezer-ortega',
    order: 4,
    name: 'Eliezer Ortega',
    company: 'OrtegaLabs',
    country: 'Paraguay',
    talk: 'El atacante también tiene IA',
    abstract:
      'El riesgo nuevo de los agentes de IA, con evidencias de pentesting autorizado.',
    image: `${IMAGE_BASE}/eliezer-seguridad.jpg`,
    imageAlt:
      'Eliezer Ortega (OrtegaLabs, Paraguay) — El atacante también tiene IA',
  },
  {
    id: 'carlos-insfran',
    order: 5,
    name: 'Carlos Insfrán',
    company: 'Ncoders',
    country: 'Paraguay',
    talk: 'El bootcamp invisible: lo que testear videojuegos te puede enseñar sobre calidad de software',
    abstract:
      'Bugs que no viven en una función, sino en la combinación de dos que funcionan bien.',
    image: `${IMAGE_BASE}/carlos-testing-gaming.jpg`,
    imageAlt:
      'Carlos Insfrán (Ncoders, Paraguay) — El bootcamp invisible: lo que testear videojuegos te puede enseñar sobre calidad de software',
  },
  {
    id: 'steven-gracia-ayala',
    order: 6,
    name: 'Steven Gracia Ayala',
    company: 'Aiquaa',
    country: 'Paraguay',
    talk: 'Pruebas de Rendimiento y el dolor oculto',
    abstract:
      'Herramientas de performance, la IA como acelerador y el impacto real en el negocio.',
    image: `${IMAGE_BASE}/steven-performance.jpg`,
    imageAlt:
      'Steven Gracia Ayala (Aiquaa, Paraguay) — Pruebas de Rendimiento y el dolor oculto',
  },
];

export const PY_TESTING_FEST_2026 = {
  slug: 'py-testing-fest-2026',
  href: '/eventos/py-testing-fest-2026',
  title: 'PY Testing Fest 2026',
  edition: 'K-Edition · Cooperación Paraguay–Corea',
  tagline:
    'IA, automatización, performance, seguridad ofensiva y videojuegos. Para perfiles QA y de desarrollo, de todos los niveles.',
  organizer: 'PY Testing Community',
  dateLabel: 'Sábado 26 de septiembre de 2026',
  /** Inicio del evento en hora de Asunción (UTC-3). */
  startsAt: '2026-09-26T09:00:00-03:00',
  /** El slide promocional deja de mostrarse pasada esta fecha. */
  hidePromoAfter: '2026-09-27T00:00:00-03:00',
  venue: 'Hotel Sheraton, Asunción',
  city: 'Asunción',
  country: 'Paraguay',
  registrationUrl: 'https://forms.gle/sEHRrBRMZX8x86V98',
  contactEmail: 'pytestingcommunity@gmail.com',
  highlights: [
    'Entrada libre y gratuita',
    'Cupo presencial limitado',
    'Transmisión en vivo',
    'Certificado de asistencia',
  ],
  registrationNote:
    'El registro es obligatorio para participar de los sorteos, exclusivos para quienes asistan de forma presencial.',
  speakers: SPEAKERS,
  sponsors: {
    auspician: ['CIT', 'KOICA'],
    apoyan: [
      'QActions',
      'Cisoft',
      'brightest',
      '40AU',
      'aiquaa',
      'QArmy',
      'IT Alianza',
    ],
  },
  sponsorsImage: `${IMAGE_BASE}/sponsors.jpg`,
  sponsorsImageAlt:
    'Organizaciones que auspician y apoyan el PY Testing Fest 2026: CIT, KOICA, QActions, Cisoft, brightest, 40AU, aiquaa, QArmy e IT Alianza',
} as const;

/**
 * El promo del evento se muestra hasta el final del día del evento.
 *
 * `now` es inyectable para que los tests no dependan del reloj real.
 */
export function isEventPromoVisible(now: number = Date.now()): boolean {
  return now < new Date(PY_TESTING_FEST_2026.hidePromoAfter).getTime();
}
