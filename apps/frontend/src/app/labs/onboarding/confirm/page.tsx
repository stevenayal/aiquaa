export default function LabsOnboardingConfirmPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Estado de verificación
        </h1>
        <p className="mt-4 text-slate-600">
          Usa esta pantalla como referencia pedagógica: después del alta, el
          alumno debe poder explicar qué estado visible espera ver, qué
          evidencia necesita y cómo lo validaría por UI y por API.
        </p>
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          Criterio sugerido: después del registro, el usuario queda en estado
          pendiente de verificación y el sistema informa el próximo paso sin
          depender de integraciones productivas.
        </div>
      </div>
    </div>
  );
}
