'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshToken } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Verificar que searchParams no sea null
        if (!searchParams) {
          setStatus('error');
          setMessage('Error al obtener parámetros de la URL. Por favor, intenta nuevamente.');
          return;
        }

        const accessToken = searchParams.get('access_token');
        
        if (!accessToken) {
          setStatus('error');
          setMessage('No se recibió el token de acceso. Por favor, intenta nuevamente.');
          return;
        }

        // Guardar el token en localStorage
        localStorage.setItem('access_token', accessToken);
        
        // Intentar obtener información del usuario
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
        const userResponse = await fetch(`${backendUrl}/api/v1/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (userResponse.ok) {
          // Actualizar el contexto de autenticación
          // Nota: Esto requeriría modificar el AuthContext para aceptar un usuario externo
          // Por ahora, redirigimos y el AuthContext se actualizará automáticamente
          
          setStatus('success');
          setMessage('¡Autenticación exitosa! Redirigiendo...');
          
          // Redirigir después de 2 segundos
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          throw new Error('Error al obtener información del usuario');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('Error durante la autenticación. Por favor, intenta nuevamente.');
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, refreshToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center mb-4">
            <img
              className="h-12 w-auto"
              src="/images/logo1.png"
              alt="AIQUAA Logo"
            />
          </div>
          
          {status === 'loading' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Completando autenticación...
              </h2>
              <div className="flex justify-center">
                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600 mt-4">
                Estamos procesando tu autenticación...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Autenticación exitosa!
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Error de autenticación
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Volver al login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
