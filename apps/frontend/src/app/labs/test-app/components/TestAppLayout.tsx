'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  getCurrentUser,
  setCurrentUser,
  findUserByEmail,
  addUser,
} from '../lib/storage';
import { initializeApp, needsInitialization } from '../lib/seedData';
import { logLogout } from '../lib/auditLog';
import type { User as LabUser } from '../lib/types';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface TestAppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function TestAppLayout({
  children,
  requireAuth = false,
}: TestAppLayoutProps) {
  const [labUser, setLabUser] = useState<LabUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();

  useEffect(() => {
    if (needsInitialization()) {
      initializeApp();
    }

    if (isLoading) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!user) {
      setLabUser(null);
      return;
    }

    const email = user.email || 'labs-user@aiquaa.com';
    const existingUser = findUserByEmail(email);
    const resolvedUser: LabUser = existingUser || {
      id: `lab-user-${user.id}`,
      email,
      password: 'managed-by-platform-auth',
      name:
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        email.split('@')[0] ||
        'Usuario Labs',
      phone: '',
      timezone: 'America/Asuncion',
      createdAt: new Date().toISOString(),
    };

    if (!existingUser) {
      addUser(resolvedUser);
    }

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.email !== resolvedUser.email) {
      setCurrentUser(resolvedUser);
    }

    setLabUser(resolvedUser);
  }, [requireAuth, pathname, router, user, isAuthenticated, isLoading]);

  const handleLeaveLab = () => {
    logLogout();
    setCurrentUser(null);
    setLabUser(null);
    router.push('/labs');
  };

  if (isLoading || (requireAuth && isAuthenticated && !labUser)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando laboratorio...</p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/labs/test-app"
                className="text-2xl font-bold text-amber-600"
              >
                AIQUAA Test App
              </Link>
              <p className="text-xs text-gray-500 mt-1">
                Laboratorio controlado
              </p>
            </div>

            <nav className="flex items-center space-x-6">
              {labUser ? (
                <>
                  <Link
                    href="/labs/test-app/catalog"
                    data-testid="nav-catalog"
                    className={`text-sm font-medium ${
                      isActive('/labs/test-app/catalog')
                        ? 'text-amber-600'
                        : 'text-gray-700 hover:text-amber-600'
                    }`}
                  >
                    Catalogo
                  </Link>
                  <Link
                    href="/labs/test-app/cart"
                    data-testid="nav-cart"
                    className={`text-sm font-medium ${
                      isActive('/labs/test-app/cart')
                        ? 'text-amber-600'
                        : 'text-gray-700 hover:text-amber-600'
                    }`}
                  >
                    Carrito
                  </Link>
                  <Link
                    href="/labs/test-app/history"
                    data-testid="nav-history"
                    className={`text-sm font-medium ${
                      isActive('/labs/test-app/history')
                        ? 'text-amber-600'
                        : 'text-gray-700 hover:text-amber-600'
                    }`}
                  >
                    Historial
                  </Link>
                  <Link
                    href="/labs/test-app/support"
                    data-testid="nav-support"
                    className={`text-sm font-medium ${
                      isActive('/labs/test-app/support')
                        ? 'text-amber-600'
                        : 'text-gray-700 hover:text-amber-600'
                    }`}
                  >
                    Soporte
                  </Link>
                  <Link
                    href="/labs/test-app/profile"
                    data-testid="nav-profile"
                    className={`text-sm font-medium ${
                      isActive('/labs/test-app/profile')
                        ? 'text-amber-600'
                        : 'text-gray-700 hover:text-amber-600'
                    }`}
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={handleLeaveLab}
                    data-testid="nav-logout"
                    className="text-sm font-medium text-gray-700 hover:text-red-600"
                  >
                    Salir del laboratorio
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/login?redirect=${encodeURIComponent('/labs/test-app/catalog')}`}
                    data-testid="nav-login"
                    className="text-sm font-medium text-gray-700 hover:text-amber-600"
                  >
                    Iniciar sesion
                  </Link>
                  <Link
                    href={`/register?redirect=${encodeURIComponent('/labs/test-app/catalog')}`}
                    data-testid="nav-register"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>AIQUAA Test App - Laboratorio aislado del producto</p>
            <div className="flex space-x-4">
              <Link href="/labs/auth" className="hover:text-amber-600">
                Acceso
              </Link>
              <Link href="/labs/onboarding" className="hover:text-amber-600">
                Onboarding
              </Link>
              <Link
                href="/labs/test-app/evidence"
                className="hover:text-amber-600"
              >
                Evidencias
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
