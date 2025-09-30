'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert } from '@/components/common';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const getErrorMessage = (error: string | null | undefined) => {
    switch (error) {
      case 'Configuration':
        return 'Hay un problema con la configuración del servidor. Contacta al administrador.';
      case 'AccessDenied':
        return 'Acceso denegado. No tienes permisos para acceder a esta aplicación.';
      case 'Verification':
        return 'El enlace de verificación ha expirado o ya ha sido usado.';
      case 'Default':
        return 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.';
      case 'OAuthSignin':
        return 'Error al iniciar el proceso de autenticación. Intenta nuevamente.';
      case 'OAuthCallback':
        return 'Error al procesar la respuesta del proveedor de autenticación.';
      case 'OAuthCreateAccount':
        return 'No se pudo crear la cuenta. El email podría estar en uso.';
      case 'EmailCreateAccount':
        return 'No se pudo crear la cuenta. El email podría estar en uso.';
      case 'Callback':
        return 'Error en el proceso de autenticación. Intenta nuevamente.';
      case 'OAuthAccountNotLinked':
        return 'Tu email ya está vinculado con otro proveedor. Inicia sesión con el método original o contacta al soporte.';
      case 'EmailSignin':
        return 'Error al enviar el email de verificación. Intenta nuevamente.';
      case 'CredentialsSignin':
        return 'Las credenciales proporcionadas son incorrectas. Verifica tu email y contraseña.';
      case 'SessionRequired':
        return 'Debes iniciar sesión para acceder a esta página.';
      case 'registration_disabled':
        return 'El registro está temporalmente deshabilitado. Contacta al administrador.';
      default:
        return 'Ha ocurrido un error durante la autenticación. Por favor, intenta nuevamente.';
    }
  };

  const getErrorTitle = (error: string | null | undefined) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Credenciales incorrectas';
      case 'OAuthAccountNotLinked':
        return 'Cuenta ya vinculada';
      case 'AccessDenied':
        return 'Acceso denegado';
      case 'Configuration':
        return 'Error de configuración';
      default:
        return 'Error de autenticación';
    }
  };

  const errorMessage = getErrorMessage(error);
  const errorTitle = getErrorTitle(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            {errorTitle}
          </h1>
          <p className="text-gray-600 mb-8">
            {errorMessage}
          </p>
        </div>

        <div className="space-y-4">
          <Alert
            type="error"
            message={errorMessage}
            onClose={() => {}}
          />

          <div className="flex flex-col space-y-3">
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Intentar nuevamente
            </Link>
            
            <Link
              href="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Crear nueva cuenta
            </Link>
            
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Información de depuración:</h3>
            <p className="text-xs text-gray-600 font-mono">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
