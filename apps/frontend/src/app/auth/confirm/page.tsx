'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function AuthConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleConfirm = async () => {
      try {
        const code = searchParams?.get('code');
        const errorParam = searchParams?.get('error');
        const errorDescription = searchParams?.get('error_description');

        if (errorParam) {
          setStatus('error');
          setMessage(errorDescription || 'Error durante la confirmación.');
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('Código de confirmación no encontrado.');
          return;
        }

        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setStatus('error');
          setMessage('El enlace expiró o ya fue usado. Solicitá uno nuevo.');
          return;
        }

        setStatus('success');
        setMessage('¡Cuenta confirmada! Redirigiendo...');
        setTimeout(() => router.push('/'), 2000);
      } catch {
        setStatus('error');
        setMessage('Error inesperado. Intentá de nuevo.');
      }
    };

    handleConfirm();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-12 w-12 flex items-center justify-center mb-4">
          <Image src="/images/logo1.png" alt="AIQUAA" width={48} height={48} className="h-12 w-auto" />
        </div>

        {status === 'loading' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900">Confirmando cuenta...</h2>
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">¡Email confirmado!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Error de confirmación</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
            >
              Volver al registro
            </button>
          </>
        )}
      </div>
    </div>
  );
}
