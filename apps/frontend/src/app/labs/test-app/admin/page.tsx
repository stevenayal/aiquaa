'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TestAppLayout from '../components/TestAppLayout';
import { useToast } from '../components/Toast';
import { getCandidateId, setCandidateId } from '../lib/prng';
import {
  ALL_BUGS,
  getBugsWithStatus,
  overrideActiveBugs,
  clearBugOverrides,
} from '../lib/bugsManifest';
import { seedData } from '../lib/seedData';
import { clearAllData, resetSession } from '../lib/storage';
import { clearAuditLog } from '../lib/auditLog';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'aiquaa-test-admin-2024';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [candidateId, setCandId] = useState('');
  const [bugs, setBugs] = useState(ALL_BUGS);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const key = searchParams?.get('key');
    if (key === ADMIN_KEY) {
      setAuthorized(true);
      const currentId = getCandidateId() || 'default';
      setCandId(currentId);
      refreshBugs();
    } else {
      setAuthorized(false);
    }
  }, [searchParams]);

  const refreshBugs = () => {
    const currentId = getCandidateId() || 'default';
    const bugsWithStatus = getBugsWithStatus(currentId);
    setBugs(bugsWithStatus);
  };

  const handleBugToggle = (bugId: string) => {
    const currentlyActive = bugs.filter((b) => b.enabled).map((b) => b.id);
    const newActive = currentlyActive.includes(bugId)
      ? currentlyActive.filter((id) => id !== bugId)
      : [...currentlyActive, bugId];

    overrideActiveBugs(newActive);
    refreshBugs();
    showToast('Bug status actualizado', 'success');
  };

  const handleReseed = () => {
    if (!candidateId) {
      showToast('Ingresa un Candidate ID', 'error');
      return;
    }

    clearAllData();
    clearAuditLog();
    setCandidateId(candidateId);
    seedData(candidateId);
    refreshBugs();
    showToast('Datos regenerados con éxito', 'success');
    setTimeout(() => {
      router.push('/labs/test-app/catalog');
    }, 1000);
  };

  const handleResetSession = () => {
    resetSession();
    clearAuditLog();
    showToast('Sesión reseteada', 'success');
    setTimeout(() => {
      router.push('/labs/test-app/login');
    }, 500);
  };

  const handleClearOverrides = () => {
    clearBugOverrides();
    refreshBugs();
    showToast('Overrides eliminados', 'success');
  };

  if (!authorized) {
    return (
      <TestAppLayout>
        <div className="max-w-md mx-auto mt-12 bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Se requiere clave de administrador para acceder.</p>
          <p className="text-sm text-gray-500">
            Accede con: /labs/test-app/admin?key=&lt;ADMIN_KEY&gt;
          </p>
        </div>
      </TestAppLayout>
    );
  }

  return (
    <TestAppLayout>
      {ToastComponent}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-sm text-gray-600">
            <strong>Objetivo:</strong> Gestionar bugs, datos y sesiones de prueba
          </p>
        </div>

        {/* Candidate ID Manager */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Candidate ID</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={candidateId}
              onChange={(e) => setCandId(e.target.value)}
              placeholder="Ingresa Candidate ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              onClick={handleReseed}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Reseed con este ID
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Cambiar el ID regenerará todos los datos (productos, bugs activos, etc.)
          </p>
        </div>

        {/* Bug Manifest */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Bug Manifest</h2>
            <button
              onClick={handleClearOverrides}
              className="text-sm px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear Overrides
            </button>
          </div>

          <div className="space-y-2">
            {bugs.map((bug) => (
              <div
                key={bug.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={bug.enabled}
                      onChange={() => handleBugToggle(bug.id)}
                      className="w-5 h-5 text-amber-600 focus:ring-amber-500 rounded"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{bug.name}</h3>
                      <p className="text-sm text-gray-600">{bug.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bug.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : bug.severity === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : bug.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {bug.severity}
                  </span>
                  <span className="text-xs text-gray-500">{bug.affectedFeature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión de Sesión</h2>
          <div className="space-y-2">
            <button
              onClick={handleResetSession}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Reset Session (Limpia carrito, órdenes, tickets, usuario actual)
            </button>
            <p className="text-xs text-gray-500">
              Los productos y el audit log se mantendrán, solo se limpian datos del usuario
            </p>
          </div>
        </div>
      </div>
    </TestAppLayout>
  );
}
