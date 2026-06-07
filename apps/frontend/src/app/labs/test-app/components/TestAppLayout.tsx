'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, setCurrentUser } from '../lib/storage';
import { initializeApp, needsInitialization } from '../lib/seedData';
import { logLogout } from '../lib/auditLog';
import type { User } from '../lib/types';

interface TestAppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function TestAppLayout({
  children,
  requireAuth = false,
}: TestAppLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Initialize app if needed
    if (needsInitialization()) {
      initializeApp();
    }

    // Load current user
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Redirect if auth required
    if (requireAuth && !currentUser) {
      router.push('/labs/test-app/login');
    }
  }, [requireAuth, router]);

  const handleLogout = () => {
    logLogout();
    setCurrentUser(null);
    setUser(null);
    router.push('/labs/test-app/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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
              <p className="text-xs text-gray-500 mt-1">Solo para evaluación</p>
            </div>

            <nav className="flex items-center space-x-6">
              {user ? (
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
                    Catálogo
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
                    onClick={handleLogout}
                    data-testid="nav-logout"
                    className="text-sm font-medium text-gray-700 hover:text-red-600"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/labs/test-app/login"
                    data-testid="nav-login"
                    className="text-sm font-medium text-gray-700 hover:text-amber-600"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/labs/test-app/register"
                    data-testid="nav-register"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>AIQUAA Test App — Solo para evaluación</p>
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
