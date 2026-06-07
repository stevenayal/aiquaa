'use client';

export default function LabsResetPasswordPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Reset de contrasena
        </h1>
        <p className="mt-3 text-slate-600">
          Pantalla de referencia del laboratorio. No ejecuta cambios reales
          sobre usuarios ni sobre contrasenas productivas; solo describe el
          contrato esperado para las practicas.
        </p>

        <div className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-sm text-cyan-950">
          <p className="font-medium">Contrato de referencia</p>
          <p className="mt-2">
            <code>POST /api/v1/auth/reset</code>
          </p>
          <p className="mt-4">
            Caso de practica sugerido: token valido, token expirado y mensaje de
            error controlado.
          </p>
        </div>
      </div>
    </div>
  );
}
