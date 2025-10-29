'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TestAppLayout from '../components/TestAppLayout';
import { useToast } from '../components/Toast';
import { apiLogin } from '../lib/mockApi';
import { logLogin } from '../lib/auditLog';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiLogin(email, password);

      if (response.success) {
        logLogin(email, true);
        showToast('Inicio de sesión exitoso', 'success');
        setTimeout(() => {
          router.push('/labs/test-app/catalog');
        }, 500);
      } else {
        logLogin(email, false);
        showToast(response.error || 'Error al iniciar sesión', 'error');
      }
    } catch (error) {
      logLogin(email, false);
      showToast('Error inesperado', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TestAppLayout>
      {ToastComponent}
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
          <p className="text-sm text-gray-600 mb-6">
            <strong>Objetivo:</strong> Autenticar usuarios en la plataforma
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 font-medium mb-2">Credenciales demo:</p>
            <p className="text-xs text-blue-800">Email: tester@aiquaa.com</p>
            <p className="text-xs text-blue-800">Contraseña: Test1234!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/labs/test-app/register" className="text-amber-600 hover:text-amber-700 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </TestAppLayout>
  );
}
