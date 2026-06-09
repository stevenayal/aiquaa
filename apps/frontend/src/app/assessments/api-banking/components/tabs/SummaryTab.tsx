'use client';

interface Props {
  summary: string;
  onChange: (v: string) => void;
}

export function SummaryTab({ summary, onChange }: Props) {
  const charCount = summary.length;
  const isGood = charCount >= 100;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Resumen ejecutivo
        </h2>
        <p className="text-xs text-slate-500">
          Describí tus hallazgos principales, riesgos identificados y
          recomendaciones. Mínimo 100 caracteres.
        </p>
      </div>

      <textarea
        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={12}
        placeholder={`Ejemplo:

Durante la evaluación de la API bancaria identifiqué los siguientes hallazgos críticos:

1. **Bug de autorización**: El endpoint GET /accounts/{accountId} no valida que la cuenta pertenezca al usuario autenticado...

2. **Exposición de datos sensibles**: GET /users/me incluye el campo internalRiskScore...

Riesgos principales: [...]
Recomendaciones: [...]`}
        value={summary}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="flex justify-between text-xs">
        <span
          className={
            charCount > 0
              ? isGood
                ? 'text-green-600'
                : 'text-amber-500'
              : 'text-slate-400'
          }
        >
          {charCount} caracteres {isGood ? '✓' : `(mín. 100)`}
        </span>
        <span className="text-slate-400">
          {charCount >= 300
            ? 'Excelente extensión'
            : charCount >= 150
              ? 'Buena extensión'
              : ''}
        </span>
      </div>
    </div>
  );
}
