'use client';

/**
 * Barra de búsqueda y filtros compartida por los catálogos (/assessments, /labs).
 *
 * Existe para que la parte accesible se escriba una sola vez: label asociado de
 * verdad (no un placeholder haciendo de etiqueta), `aria-pressed` en cada chip
 * para que un lector de pantalla sepa si está aplicado, y el contador de
 * resultados en `aria-live` porque filtrar es un cambio silencioso para quien no
 * ve la grilla.
 */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  legend: string;
  options: FilterOption[];
  value: string;
  onChange: (_value: string) => void;
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
        active
          ? 'border-cyan-500 bg-cyan-500 text-slate-950'
          : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

export default function CatalogFilterBar({
  inputId,
  searchLabel,
  searchPlaceholder,
  query,
  onQueryChange,
  groups,
  resultCount,
  totalCount,
  itemNoun,
  isFiltering,
  onClear,
}: {
  inputId: string;
  searchLabel: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (_value: string) => void;
  groups: FilterGroup[];
  resultCount: number;
  totalCount: number;
  itemNoun: string;
  isFiltering: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {searchLabel}
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={searchPlaceholder}
        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
      />

      <div className="mt-5 space-y-4">
        {groups.map((group) => (
          <fieldset key={group.id}>
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {group.legend}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map((option) => (
                <FilterChip
                  key={option.value}
                  active={group.value === option.value}
                  onClick={() => group.onChange(option.value)}
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p
          aria-live="polite"
          className="text-sm text-slate-600 dark:text-slate-400"
        >
          {resultCount === totalCount
            ? `${totalCount} ${itemNoun}`
            : `${resultCount} de ${totalCount} ${itemNoun}`}
        </p>
        {isFiltering ? (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-semibold text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-300"
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </div>
  );
}
