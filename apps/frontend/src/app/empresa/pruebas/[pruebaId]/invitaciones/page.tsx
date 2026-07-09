'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getPruebaAction,
  listPruebaInvitacionesAction,
  createPruebaInvitacionAction,
  revokePruebaInvitacionAction,
  type EmpresaPrueba,
  type EmpresaPruebaInvitacion,
} from '@/actions/empresa-pruebas';

export default function InvitacionesPage() {
  const { isDarkMode } = useTheme();
  const params = useParams<{ pruebaId: string }>();
  const pruebaId = params.pruebaId;

  const [prueba, setPrueba] = useState<EmpresaPrueba | null>(null);
  const [invitaciones, setInvitaciones] = useState<EmpresaPruebaInvitacion[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      getPruebaAction(pruebaId),
      listPruebaInvitacionesAction(pruebaId),
    ]).then(([pruebaRes, invRes]) => {
      setPrueba(pruebaRes.data);
      setInvitaciones(invRes.data ?? []);
      setError(pruebaRes.error ?? invRes.error);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pruebaId]);

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;
  const cardClass = `rounded-xl border p-5 ${isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'}`;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const { error } = await createPruebaInvitacionAction({
      prueba_id: pruebaId,
      candidate_email: candidateEmail.trim() || undefined,
      candidate_name: candidateName.trim() || undefined,
    });
    setCreating(false);
    if (error) {
      setError(error);
      return;
    }
    setCandidateEmail('');
    setCandidateName('');
    load();
  };

  const handleRevoke = async (invitacion: EmpresaPruebaInvitacion) => {
    if (!confirm('¿Revocar esta invitación? El link dejará de funcionar.'))
      return;
    const { error } = await revokePruebaInvitacionAction(
      invitacion.id,
      pruebaId
    );
    if (error) {
      setError(error);
      return;
    }
    load();
  };

  const linkFor = (token: string) =>
    typeof window !== 'undefined'
      ? `${window.location.origin}/prueba/${token}`
      : `/prueba/${token}`;

  const handleCopy = (invitacion: EmpresaPruebaInvitacion) => {
    navigator.clipboard.writeText(linkFor(invitacion.token));
    setCopiedId(invitacion.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href={`/empresa/pruebas/${pruebaId}`}
            className={`text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
          >
            ← {prueba?.title ?? 'Prueba'}
          </Link>
          <h1
            className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Invitaciones
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Generá un link por candidato (o genérico) para que rinda la prueba.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className={`${cardClass} space-y-4 mb-6`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Email del candidato{' '}
                <span
                  className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}
                >
                  (opcional)
                </span>
              </label>
              <input
                type="email"
                className={inputClass}
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>
                Nombre{' '}
                <span
                  className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}
                >
                  (opcional)
                </span>
              </label>
              <input
                type="text"
                className={inputClass}
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Generando...' : 'Generar link de invitación'}
          </button>
        </form>

        {loading ? (
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
            Cargando...
          </p>
        ) : invitaciones.length === 0 ? (
          <div className={cardClass}>
            <p
              className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Todavía no generaste ninguna invitación.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitaciones.map((invitacion) => (
              <div key={invitacion.id} className={cardClass}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p
                      className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                    >
                      {invitacion.candidate_name ||
                        invitacion.candidate_email ||
                        'Link genérico'}
                    </p>
                    <p
                      className={`text-xs mt-0.5 font-mono break-all ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                    >
                      {linkFor(invitacion.token)}
                    </p>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                        invitacion.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {invitacion.status === 'active' ? 'Activa' : 'Revocada'}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(invitacion)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:border-slate-500' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                    >
                      {copiedId === invitacion.id ? '✅ Copiado' : '📋 Copiar'}
                    </button>
                    {invitacion.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(invitacion)}
                        className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                      >
                        Revocar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
