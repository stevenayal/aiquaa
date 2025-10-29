'use client';

import { useState, useEffect } from 'react';
import TestAppLayout from '../components/TestAppLayout';
import { useToast } from '../components/Toast';
import { getCurrentUser } from '../lib/storage';
import { apiUpdateProfile } from '../lib/mockApi';
import { logUpdateProfile } from '../lib/auditLog';
import type { User } from '../lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.name);
      setPhone(currentUser.phone);
      setTimezone(currentUser.timezone);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = { name, phone, timezone };
      const response = await apiUpdateProfile(updates);

      if (response.success) {
        logUpdateProfile(Object.keys(updates));
        setUser(response.data!);
        showToast('Perfil actualizado correctamente', 'success');
      } else {
        showToast(response.error || 'Error al actualizar perfil', 'error');
      }
    } catch (error) {
      showToast('Error inesperado', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TestAppLayout requireAuth>
      {ToastComponent}
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-sm text-gray-600">
            <strong>Objetivo:</strong> Actualizar información personal del usuario
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+595 991 234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                Zona Horaria *
              </label>
              <select
                id="timezone"
                required
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="America/Asuncion">América/Asunción (GMT-4)</option>
                <option value="America/Buenos_Aires">América/Buenos Aires (GMT-3)</option>
                <option value="America/Sao_Paulo">América/São Paulo (GMT-3)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      </div>
    </TestAppLayout>
  );
}
