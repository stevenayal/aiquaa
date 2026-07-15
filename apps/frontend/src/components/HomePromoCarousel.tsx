'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { apiDeveloperFundamentalsDefinition } from '@/app/assessments/api-developer-fundamentals/data/assessment-definition';
import { apiTestingFundamentalsDefinition } from '@/app/assessments/api-testing-fundamentals/data/assessment-definition';
import { databaseFundamentalsDefinition } from '@/app/assessments/database-fundamentals/data/assessment-definition';
import { databasePracticeDefinition } from '@/app/assessments/database-practice/data/assessment-definition';
import { infrastructureFundamentalsDefinition } from '@/app/assessments/infrastructure-fundamentals/data/assessment-definition';
import LineIcon, { LineIconName } from '@/components/icons/LineIcon';

interface PromoSlide {
  id: string;
  badge: string;
  icon: LineIconName;
  title: string;
  description: string;
  meta: string[];
  href: string;
  cta: string;
  color: string;
}

const AUTOPLAY_MS = 5000;

function assessmentSlide(
  definition: {
    slug: string;
    title: string;
    level: string;
    duration_minutes: number;
    total_score: number;
  },
  description: string,
  color: string
): PromoSlide {
  return {
    id: definition.slug,
    badge: 'Nuevo 2026',
    icon: 'flask',
    title: definition.title,
    description,
    meta: [
      definition.level,
      `${definition.duration_minutes} min`,
      `${definition.total_score} pts`,
    ],
    href: `/assessments/${definition.slug}`,
    cta: 'Ver assessment →',
    color,
  };
}

const SLIDES: PromoSlide[] = [
  {
    id: 'ranking',
    badge: 'Ranking',
    icon: 'trophy',
    title: 'Ranking AIQUAA',
    description:
      'Competí en el podio de cada categoría, subí de nivel y ganá XP en la comunidad.',
    meta: ['Leaderboards por categoría', 'XP de comunidad', 'Tiempo real'],
    href: '/ranking',
    cta: 'Ver ranking →',
    color: 'from-purple-500 to-fuchsia-600',
  },
  assessmentSlide(
    apiTestingFundamentalsDefinition,
    'Interpretá documentación de API y analizá respuestas como en un caso real.',
    'from-cyan-500 to-sky-600'
  ),
  assessmentSlide(
    databaseFundamentalsDefinition,
    'Modelo relacional, claves y consultas SELECT desde cero.',
    'from-amber-500 to-yellow-600'
  ),
  assessmentSlide(
    databasePracticeDefinition,
    'Detectá bugs en queries y escribí SQL para resolver casos reales.',
    'from-emerald-500 to-teal-600'
  ),
  assessmentSlide(
    infrastructureFundamentalsDefinition,
    'Docker y Kubernetes: de fundamentos a arquitectura.',
    'from-blue-500 to-indigo-600'
  ),
  assessmentSlide(
    apiDeveloperFundamentalsDefinition,
    'Fundamentos de APIs REST pensados para quien recién arranca a programar.',
    'from-indigo-500 to-violet-600'
  ),
  {
    id: 'api-banking',
    badge: 'Nuevo 2026',
    icon: 'bug',
    title: 'API Testing — Challenge práctico',
    description:
      'Elegí entre Rick and Morty, Chuck Norris o NASA. Diseñá casos, documentá hallazgos y generá un reporte profesional.',
    meta: ['Semi Senior', '90-120 min', '100 pts'],
    href: '/assessments/api-banking',
    cta: 'Ver challenge →',
    color: 'from-rose-500 to-red-600',
  },
];

export default function HomePromoCarousel() {
  const { isDarkMode } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPaused]);

  return (
    <section
      className={`py-12 md:py-16 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={containerRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Novedades: pruebas técnicas 2026 y ranking"
          tabIndex={0}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
          }}
          className="relative rounded-2xl overflow-hidden shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/40"
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="w-full shrink-0"
                aria-hidden={slide.id !== SLIDES[activeIndex].id}
                aria-live={
                  slide.id === SLIDES[activeIndex].id ? 'polite' : undefined
                }
              >
                <Link
                  href={slide.href}
                  className={`block bg-gradient-to-r ${slide.color} p-8 md:p-12 text-white`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6 px-9 md:px-0">
                    <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/15 backdrop-blur-sm grid place-items-center">
                      <LineIcon
                        name={slide.icon}
                        size={36}
                        strokeWidth={1.4}
                        className="text-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold mb-3">
                        {slide.badge}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">
                        {slide.title}
                      </h3>
                      <p className="text-white/90 text-sm md:text-base mb-4 max-w-2xl">
                        {slide.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {slide.meta.map((m) => (
                          <span
                            key={m}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/15"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-2 font-semibold text-sm underline underline-offset-4">
                        {slide.cta}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Flechas */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Novedad anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          >
            <LineIcon name="arrow" size={16} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Siguiente novedad"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          >
            <LineIcon name="arrow" size={16} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a novedad ${i + 1}: ${slide.title}`}
                aria-current={i === activeIndex}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === activeIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
