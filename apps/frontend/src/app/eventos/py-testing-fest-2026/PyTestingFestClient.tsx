'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { PY_TESTING_FEST_2026 as EVENT } from '@/lib/events/py-testing-fest-2026';

export default function PyTestingFestClient() {
  const { isDarkMode } = useTheme();

  const heading = isDarkMode ? 'text-white' : 'text-brand-text';
  const muted = isDarkMode ? 'text-slate-300' : 'text-brand-muted';
  const card = isDarkMode ? 'bg-slate-800' : 'bg-white';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
      }`}
    >
      {/* Hero */}
      <section
        className={`relative overflow-hidden ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900'
            : 'bg-gradient-to-br from-blue-50 via-white to-rose-50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white mb-5">
            {EVENT.edition}
          </span>
          <h1
            className={`text-4xl md:text-6xl font-bold mb-5 max-w-4xl ${heading}`}
          >
            {EVENT.title}
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mb-8 ${muted}`}>
            {EVENT.tagline}
          </p>

          <dl className="flex flex-wrap gap-x-10 gap-y-4 mb-8">
            <div>
              <dt className={`text-xs uppercase tracking-wide ${muted}`}>
                Fecha
              </dt>
              <dd className={`text-base md:text-lg font-semibold ${heading}`}>
                {EVENT.dateLabel}
              </dd>
            </div>
            <div>
              <dt className={`text-xs uppercase tracking-wide ${muted}`}>
                Lugar
              </dt>
              <dd className={`text-base md:text-lg font-semibold ${heading}`}>
                {EVENT.venue}
              </dd>
            </div>
            <div>
              <dt className={`text-xs uppercase tracking-wide ${muted}`}>
                Organiza
              </dt>
              <dd className={`text-base md:text-lg font-semibold ${heading}`}>
                {EVENT.organizer}
              </dd>
            </div>
          </dl>

          <ul className="flex flex-wrap gap-2 mb-8">
            {EVENT.highlights.map((highlight) => (
              <li
                key={highlight}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-white text-brand-text shadow-sm'
                }`}
              >
                {highlight}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <a
              href={EVENT.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:from-sky-600 hover:to-blue-700 transition-colors"
            >
              Inscribirme gratis
              <span aria-hidden="true">→</span>
            </a>
            <p className={`text-sm max-w-md ${muted}`}>
              {EVENT.registrationNote}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Programa */}
        <section aria-labelledby="programa" className="mb-16 md:mb-20">
          <h2 id="programa" className={`text-3xl font-bold mb-3 ${heading}`}>
            El programa
          </h2>
          <p className={`mb-8 ${muted}`}>
            Seis charlas sobre IA, automatización, performance, seguridad
            ofensiva y videojuegos.
          </p>
          <ol className="space-y-4">
            {EVENT.speakers.map((speaker) => (
              <li
                key={speaker.id}
                className={`${card} rounded-lg shadow-lg p-6 flex flex-col sm:flex-row gap-4`}
              >
                <span
                  className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold grid place-items-center"
                  aria-hidden="true"
                >
                  {speaker.order}
                </span>
                <div className="min-w-0">
                  <h3 className={`text-lg font-bold mb-1 ${heading}`}>
                    {speaker.talk}
                  </h3>
                  <p className={`text-sm mb-2 ${muted}`}>{speaker.abstract}</p>
                  <p className={`text-sm font-medium ${heading}`}>
                    {speaker.name}
                    <span className={`font-normal ${muted}`}>
                      {' '}
                      · {speaker.company} · {speaker.country}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Speakers */}
        <section aria-labelledby="speakers" className="mb-16 md:mb-20">
          <h2 id="speakers" className={`text-3xl font-bold mb-8 ${heading}`}>
            Quiénes exponen
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVENT.speakers.map((speaker) => (
              <li
                key={speaker.id}
                className={`${card} rounded-lg shadow-lg overflow-hidden`}
              >
                <Image
                  src={speaker.image}
                  alt={speaker.imageAlt}
                  width={1080}
                  height={1080}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 360px"
                  className="w-full h-auto"
                />
                <div className="p-5">
                  <h3 className={`text-lg font-bold ${heading}`}>
                    {speaker.name}
                  </h3>
                  <p className={`text-sm mb-2 ${muted}`}>
                    {speaker.company} · {speaker.country}
                  </p>
                  <p className={`text-sm font-medium ${heading}`}>
                    {speaker.talk}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Sponsors */}
        <section aria-labelledby="sponsors" className="mb-16 md:mb-20">
          <h2 id="sponsors" className={`text-3xl font-bold mb-3 ${heading}`}>
            Gracias por acompañarnos
          </h2>
          <p className={`mb-8 ${muted}`}>
            Este evento existe porque un grupo de organizaciones decidió
            apoyarlo.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className={`${card} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-xs uppercase tracking-wide mb-2 ${muted}`}>
                Auspician
              </h3>
              <p className={`text-lg font-semibold mb-6 ${heading}`}>
                {EVENT.sponsors.auspician.join(' · ')}
              </p>
              <h3 className={`text-xs uppercase tracking-wide mb-2 ${muted}`}>
                Apoyan
              </h3>
              <ul className="flex flex-wrap gap-2">
                {EVENT.sponsors.apoyan.map((sponsor) => (
                  <li
                    key={sponsor}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      isDarkMode
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-brand-light text-brand-text'
                    }`}
                  >
                    {sponsor}
                  </li>
                ))}
              </ul>
            </div>
            <Image
              src={EVENT.sponsorsImage}
              alt={EVENT.sponsorsImageAlt}
              width={1080}
              height={1080}
              sizes="(max-width: 1024px) 92vw, 560px"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* CTA final */}
        <section
          aria-labelledby="inscripcion"
          className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white p-8 md:p-12"
        >
          <h2 id="inscripcion" className="text-3xl font-bold mb-3">
            Nos vemos el 26 de septiembre
          </h2>
          <p className="text-white/90 max-w-2xl mb-6">
            {EVENT.dateLabel} · {EVENT.venue}. Entrada libre y gratuita, con
            cupo presencial limitado y transmisión en vivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <a
              href={EVENT.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-white text-blue-700 font-semibold shadow-lg hover:bg-blue-50 transition-colors"
            >
              Completar la inscripción
              <span aria-hidden="true">→</span>
            </a>
            <p className="text-sm text-white/90">
              Consultas:{' '}
              <a
                href={`mailto:${EVENT.contactEmail}`}
                className="underline underline-offset-4 font-medium"
              >
                {EVENT.contactEmail}
              </a>
            </p>
          </div>
        </section>

        <p className={`mt-10 text-sm ${muted}`}>
          <Link href="/" className="underline underline-offset-4">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
