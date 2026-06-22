import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API Banking — Challenge Práctico | AIQUAA',
  description:
    'Testeá una API bancaria simulada: encontrá 12 bugs intencionales, diseñá casos, reportá bugs y recibí un score automático de 100 pts.',
  keywords: [
    'API Banking',
    'API testing práctico',
    'bugs intencionales',
    'testing bancario',
    'QA',
    'testing',
    'AIQUAA',
    'evaluación práctica',
    'desafío API',
    'reporte de bugs',
  ],
  openGraph: {
    title: 'API Banking — Challenge Práctico | AIQUAA',
    description:
      'Testeá una API bancaria simulada: encontrá 12 bugs intencionales y recibí un score automático.',
    url: 'https://aiquaa.com/assessments/api-banking',
    siteName: 'AIQUAA',
    type: 'website',
    locale: 'es_PY',
    images: [
      {
        url: '/api/og?title=API%20Banking%20Challenge&subtitle=Encontrá%2012%20bugs%20intencionales%20en%20una%20API%20bancaria&section=Assessments',
        width: 1200,
        height: 630,
        alt: 'API Banking Challenge - AIQUAA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Banking — Challenge Práctico | AIQUAA',
    description: 'Encontrá 12 bugs intencionales en una API bancaria.',
    images: [
      '/api/og?title=API%20Banking%20Challenge&subtitle=Encontrá%2012%20bugs%20intencionales&section=Assessments',
    ],
    creator: '@stevenayal',
  },
  alternates: {
    canonical: 'https://aiquaa.com/assessments/api-banking',
  },
};

export default function ApiBankingLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              API Testing
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">
              Semi Senior
            </span>
            <span className="text-xs text-slate-400">⏱ 90–120 min</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            QA API Challenge
            <span className="block text-slate-400 font-normal text-xl mt-1">
              Banking Transactions
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Auditá una API bancaria simulada como QA Engineer. Encontrá bugs
            intencionales, diseñá casos de prueba y documentá tus hallazgos en
            un reporte profesional.
          </p>
        </div>

        {/* Sections */}
        <div className="grid gap-5">
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              Qué vas a practicar
            </h2>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5 list-none">
              {[
                '🔐 Validación de autenticación y autorización JWT',
                '📋 Diseño de casos de prueba (positivos, negativos, borde, seguridad)',
                '🐛 Identificación de bugs por contrato OpenAPI',
                '🛡️ Detección de vulnerabilidades de seguridad (IDOR, data exposure)',
                '📝 Redacción de bug reports profesionales',
                '📊 Elaboración de resumen ejecutivo',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="shrink-0">{item.slice(0, 2)}</span>
                  <span>{item.slice(2)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              Cómo se evalúa
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Diseño de casos de prueba', pts: 25 },
                { label: 'Validación API / contrato OpenAPI', pts: 25 },
                {
                  label: 'Seguridad — JWT, permisos, datos sensibles',
                  pts: 20,
                },
                { label: 'Calidad del bug report', pts: 20 },
                { label: 'Resumen ejecutivo', pts: 10 },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-600 dark:text-slate-400">
                    {row.label}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {row.pts} pts
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">
              Cómo funciona
            </h2>
            <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside">
              <li>Ingresás tu nombre e iniciás el challenge</li>
              <li>Tenés acceso a la documentación de 7 endpoints bancarios</li>
              <li>Probás la API con las credenciales de prueba provistas</li>
              <li>Documentás casos de prueba y bugs en el workspace</li>
              <li>Escribís un resumen ejecutivo y enviás tu trabajo</li>
              <li>Recibís tu score automáticamente</li>
            </ol>
          </section>
        </div>

        <div className="flex gap-3">
          <Link
            href="/assessments/api-banking/start"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Iniciar challenge →
          </Link>
          <Link
            href="/assessments"
            className="inline-flex items-center px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors"
          >
            Ver todos
          </Link>
        </div>
      </div>
    </main>
  );
}
