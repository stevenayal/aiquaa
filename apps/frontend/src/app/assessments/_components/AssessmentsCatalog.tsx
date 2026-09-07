'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import CatalogFilterBar, {
  type FilterGroup,
} from '@/components/ui/CatalogFilterBar';

/**
 * Vista serializable de una evaluación.
 *
 * La página sigue siendo Server Component: arma este array desde el catálogo y
 * lo pasa como prop. Al cliente viaja solo lo que el filtro necesita leer, no
 * las definiciones completas (que traen secciones, preguntas y metadata).
 */
export interface CatalogItem {
  slug: string;
  title: string;
  description: string;
  level: string;
  durationMinutes: number;
  totalScore: number;
  icon: string;
  categoryId: string;
  categoryName: string;
  featured: boolean;
  status: 'passed' | 'in_progress' | 'attempted' | 'new';
  bestPercentage: number;
}

export interface CatalogCategory {
  id: string;
  name: string;
  description: string;
}

type StatusFilter = 'todos' | 'passed' | 'in_progress' | 'new';

/** Normaliza para buscar sin acentos: "automatizacion" encuentra "Automatización". */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function StatusBadge({ item }: { item: CatalogItem }) {
  if (item.status === 'passed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">
        Aprobado · {item.bestPercentage}%
      </span>
    );
  }
  if (item.status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-400/15 dark:text-amber-300">
        En curso
      </span>
    );
  }
  if (item.status === 'attempted') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Mejor: {item.bestPercentage}%
      </span>
    );
  }
  return null;
}

function AssessmentCard({ item }: { item: CatalogItem }) {
  const cta =
    item.status === 'in_progress'
      ? 'Continuar'
      : item.status === 'passed'
        ? 'Volver a rendir'
        : 'Ver evaluación';

  return (
    <article className="relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-cyan-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-cyan-500">
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl" aria-hidden="true">
          {item.icon}
        </span>
        <StatusBadge item={item} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
        {/*
          El enlace envuelve el título y se estira sobre la tarjeta con ::after:
          el área clickeable es la tarjeta entera (Fitts) pero el nombre
          accesible del enlace sigue siendo el título, no la tarjeta entera
          leída de corrido.
        */}
        <Link
          href={`/assessments/${item.slug}`}
          className="after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
        >
          {item.title}
        </Link>
      </h3>

      {/* Las descripciones van de 90 a 400 caracteres: sin recortar, una tarjeta
          triplica la altura de su vecina y la grilla se desarma. */}
      <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
        {item.description}
      </p>

      {/* Miller: tres datos, los que se comparan al elegir. El resto va adentro. */}
      <dl className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-700">
          <dt className="sr-only">Nivel</dt>
          <dd>{item.level}</dd>
        </div>
        <div className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-700">
          <dt className="sr-only">Duración</dt>
          <dd>{item.durationMinutes} min</dd>
        </div>
        <div className="rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-700">
          <dt className="sr-only">Puntaje total</dt>
          <dd>{item.totalScore} pts</dd>
        </div>
      </dl>

      <p className="mt-5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
        {cta} <span aria-hidden="true">→</span>
      </p>
    </article>
  );
}

export default function AssessmentsCatalog({
  items,
  categories,
  hasSession,
}: {
  items: CatalogItem[];
  categories: CatalogCategory[];
  hasSession: boolean;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('todas');
  const [level, setLevel] = useState<string>('todos');
  const [status, setStatus] = useState<StatusFilter>('todos');

  const levels = useMemo(
    () => Array.from(new Set(items.map((i) => i.level))).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter((item) => {
      if (category !== 'todas' && item.categoryId !== category) return false;
      if (level !== 'todos' && item.level !== level) return false;
      if (status !== 'todos') {
        if (status === 'new' && item.status !== 'new') return false;
        if (status === 'passed' && item.status !== 'passed') return false;
        if (status === 'in_progress' && item.status !== 'in_progress')
          return false;
      }
      if (!q) return true;
      return (
        normalize(item.title).includes(q) ||
        normalize(item.description).includes(q) ||
        normalize(item.categoryName).includes(q) ||
        normalize(item.level).includes(q)
      );
    });
  }, [items, query, category, level, status]);

  const isFiltering =
    query.trim() !== '' ||
    category !== 'todas' ||
    level !== 'todos' ||
    status !== 'todos';

  const clearAll = () => {
    setQuery('');
    setCategory('todas');
    setLevel('todos');
    setStatus('todos');
  };

  const groups: FilterGroup[] = [
    {
      id: 'categoria',
      legend: 'Categoría',
      value: category,
      onChange: setCategory,
      options: [
        { value: 'todas', label: 'Todas' },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
      ],
    },
    {
      id: 'nivel',
      legend: 'Nivel',
      value: level,
      onChange: setLevel,
      options: [
        { value: 'todos', label: 'Todos' },
        ...levels.map((l) => ({ value: l, label: l })),
      ],
    },
    // El filtro por estado solo tiene sentido con sesión: sin ella todas las
    // evaluaciones están en el mismo estado.
    ...(hasSession
      ? [
          {
            id: 'estado',
            legend: 'Estado',
            value: status,
            onChange: (value: string) => setStatus(value as StatusFilter),
            options: [
              { value: 'todos', label: 'Todas' },
              { value: 'new', label: 'Sin empezar' },
              { value: 'in_progress', label: 'En curso' },
              { value: 'passed', label: 'Aprobadas' },
            ],
          },
        ]
      : []),
  ];

  const featured = filtered.filter((i) => i.featured);
  const byCategory = categories
    .map((c) => ({
      category: c,
      items: filtered.filter((i) => i.categoryId === c.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <section aria-labelledby="filtros" className="mb-10">
        <h2 id="filtros" className="sr-only">
          Buscar y filtrar evaluaciones
        </h2>
        <CatalogFilterBar
          inputId="buscar-assessment"
          searchLabel="Buscar evaluación"
          searchPlaceholder="Docker, API, SQL…"
          query={query}
          onQueryChange={setQuery}
          groups={groups}
          resultCount={filtered.length}
          totalCount={items.length}
          itemNoun="evaluaciones"
          isFiltering={isFiltering}
          onClear={clearAll}
        />
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            No hay evaluaciones que coincidan
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Probá con otro término o quitá algún filtro.
          </p>
          {/* Salida sin salida: el estado vacío tiene que ofrecer el camino de
              vuelta, no solo informar que no hay nada. */}
          <button
            type="button"
            onClick={clearAll}
            className="mt-6 rounded-2xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          {/* Los destacados solo tienen sentido sin filtrar: con un filtro
              activo el usuario ya dijo qué busca y repetir tarjetas arriba
              duplica resultados. */}
          {!isFiltering && featured.length > 0 ? (
            <section aria-labelledby="destacados" className="mb-14">
              <h2
                id="destacados"
                className="text-xl font-semibold text-slate-900 dark:text-white"
              >
                ⭐ Para empezar
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Las evaluaciones más representativas del perfil QA.
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((item) => (
                  <AssessmentCard key={item.slug} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="space-y-14">
            {byCategory.map(({ category: c, items: groupItems }) => (
              <section key={c.id} aria-labelledby={`cat-${c.id}`}>
                <h2
                  id={`cat-${c.id}`}
                  className="text-xl font-semibold text-slate-900 dark:text-white"
                >
                  {c.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {c.description}
                </p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {groupItems.map((item) => (
                    <AssessmentCard key={item.slug} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
