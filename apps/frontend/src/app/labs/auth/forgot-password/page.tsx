'use client';

export default function LabsForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Recuperacion de acceso
        </h1>
        <p className="mt-3 text-slate-600">
          Pantalla de referencia del laboratorio. No envia solicitudes al auth
          productivo: sirve para documentar el caso, los datos esperados y el
          contrato que luego consumira cada equipo desde su propio repo de
          automatizacion.
        </p>

        <div className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-sm text-cyan-950">
          <p className="font-medium">Contrato de referencia</p>
          <p className="mt-2">
            <code>POST /api/v1/auth/request-reset</code>
          </p>
          <p className="mt-4">
            Caso de practica sugerido: verificar que el sistema responda con un
            mensaje controlado sin exponer si el email existe o no.
          </p>
        </div>
      </div>
    </div>
  );
}
