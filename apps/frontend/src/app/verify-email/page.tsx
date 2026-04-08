'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Alert } from '@/components/common';

type VerificationState = 'loading' | 'success' | 'error';

function getVerificationUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams?.get('token') ?? '', [searchParams]);
  const [status, setStatus] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('Estamos verificando tu cuenta...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('El enlace de verificación es inválido o está incompleto.');
        return;
      }

      try {
        const response = await fetch(getVerificationUrl(token), {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'No se pudo verificar el email.');
        }

        setStatus('success');
        setMessage(data.message || 'Tu email fue verificado correctamente. Ya puedes iniciar sesión.');
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'No se pudo verificar tu email. Solicita un nuevo enlace.',
        );
      }
    };

    void verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Verificación de email
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Estamos confirmando tu cuenta para que puedas usar el login y guardar tus resultados.
        </p>

        {status === 'loading' ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        ) : (
          <Alert
            type={status === 'success' ? 'success' : 'error'}
            message={message}
          />
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
          >
            Ir a iniciar sesión
          </Link>
          <Link
            href="/"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
