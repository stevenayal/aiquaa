'use client';

import type {
  AssessmentQuestion,
  TestCaseDraft,
  TestCasePriority,
  TestCaseType,
} from '../types';

const CASE_TYPES: TestCaseType[] = [
  'positivo',
  'negativo',
  'borde',
  'seguridad',
  'contrato',
];
const PRIORITIES: TestCasePriority[] = ['Alta', 'Media', 'Baja'];

function createEmptyCase(question: AssessmentQuestion): TestCaseDraft {
  return {
    title: '',
    endpoint: String(question.metadata?.endpoint ?? ''),
    method: String(question.metadata?.method ?? ''),
    preconditions: '',
    input: '',
    steps: '',
    expectedResult: '',
    caseType: 'positivo',
    priority: 'Media',
  };
}

export default function TestCaseForm({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestion;
  value: TestCaseDraft[];
  onChange: (value: TestCaseDraft[]) => void;
}) {
  const cases = value.length > 0 ? value : [createEmptyCase(question)];

  function updateCase(
    index: number,
    field: keyof TestCaseDraft,
    fieldValue: string
  ) {
    const next = cases.map((current, currentIndex) =>
      currentIndex === index ? { ...current, [field]: fieldValue } : current
    );
    onChange(next);
  }

  function addCase() {
    onChange([...cases, createEmptyCase(question)]);
  }

  function removeCase(index: number) {
    const next = cases.filter((_, currentIndex) => currentIndex !== index);
    onChange(next.length > 0 ? next : [createEmptyCase(question)]);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
        Usá el template completo: título, endpoint, método, precondiciones,
        datos, pasos, resultado esperado, tipo y prioridad.
      </div>

      {cases.map((testCase, index) => (
        <div
          key={`${question.id}-${index}`}
          className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-100">
              Caso #{index + 1}
            </p>
            <button
              type="button"
              onClick={() => removeCase(index)}
              className="text-xs font-semibold text-red-300 transition hover:text-red-200"
            >
              Eliminar
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={testCase.title}
              onChange={(event) =>
                updateCase(index, 'title', event.target.value)
              }
              placeholder="Título del caso"
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
            />
            <input
              value={testCase.endpoint}
              onChange={(event) =>
                updateCase(index, 'endpoint', event.target.value)
              }
              placeholder="Endpoint"
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
            />
            <input
              value={testCase.method}
              onChange={(event) =>
                updateCase(index, 'method', event.target.value)
              }
              placeholder="Método HTTP"
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
            />
            <select
              value={testCase.caseType}
              onChange={(event) =>
                updateCase(index, 'caseType', event.target.value)
              }
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
            >
              {CASE_TYPES.map((caseType) => (
                <option key={caseType} value={caseType}>
                  {caseType}
                </option>
              ))}
            </select>
            <select
              value={testCase.priority}
              onChange={(event) =>
                updateCase(index, 'priority', event.target.value)
              }
              className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-4">
            <textarea
              value={testCase.preconditions}
              onChange={(event) =>
                updateCase(index, 'preconditions', event.target.value)
              }
              rows={3}
              placeholder="Precondiciones"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
            />
            <textarea
              value={testCase.input}
              onChange={(event) =>
                updateCase(index, 'input', event.target.value)
              }
              rows={3}
              placeholder="Datos de entrada"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
            />
            <textarea
              value={testCase.steps}
              onChange={(event) =>
                updateCase(index, 'steps', event.target.value)
              }
              rows={4}
              placeholder="Pasos"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
            />
            <textarea
              value={testCase.expectedResult}
              onChange={(event) =>
                updateCase(index, 'expectedResult', event.target.value)
              }
              rows={4}
              placeholder="Resultado esperado"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/40"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addCase}
        className="inline-flex rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
      >
        Agregar otro caso de prueba
      </button>
    </div>
  );
}
