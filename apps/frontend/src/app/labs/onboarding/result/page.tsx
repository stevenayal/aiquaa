export default function LabsOnboardingResultPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Resultado pedagógico esperado
        </h1>
        <ul className="mt-6 space-y-3 text-sm text-slate-600">
          <li>El alumno identifica reglas de validación del formulario.</li>
          <li>
            Puede documentar el alta en Gherkin con happy path, negativo y edge
            case.
          </li>
          <li>Cuenta con datos repetibles para reintentar el escenario.</li>
          <li>
            La salida visible del flujo es lo bastante estable para Playwright.
          </li>
        </ul>
      </div>
    </div>
  );
}
