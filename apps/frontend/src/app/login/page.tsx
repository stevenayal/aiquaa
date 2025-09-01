"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const sp = useSearchParams();
  const error = sp.get("error");

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      {error === "OAuthAccountNotLinked" && (
        <p className="text-sm text-red-500">Tu email ya está vinculado con otro proveedor.</p>
      )}
      {error === "registration_disabled" && (
        <p className="text-sm text-red-500">Registro deshabilitado. Contactá al admin.</p>
      )}
      <button
        className="w-full rounded-lg border px-4 py-2"
        onClick={() => signIn("google")}
      >
        Continuar con Google
      </button>
      <button
        className="w-full rounded-lg border px-4 py-2"
        onClick={() => signIn("github")}
      >
        Continuar con GitHub
      </button>
    </main>
  );
}
