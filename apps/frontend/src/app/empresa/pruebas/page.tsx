'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
  listPruebasAction,
  deletePruebaAction,
  togglePruebaActivaAction,
  type EmpresaPrueba,
} from '@/actions/empresa-pruebas';

export default function PruebasPage() {
  const { isDarkMode } = useTheme();
  const [pruebas, setPruebas] = useState<EmpresaPrueba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listPruebasAction().then(({ data, error }) => {
      setPruebas(data ?? []);
      setError(error);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (prueba: EmpresaPrueba) => {
    const { error } = await togglePruebaActivaAction(
      prueba.id,
      !prueba.is_active
    );
    if (error) {
      setError(error);
      return;
    }
    load();
  };

  const handleDelete = async (prueba: EmpresaPrueba) => {
    if (
      !confirm(
        `¿Eliminar la prueba "${prueba.title}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    const { error } = await deletePruebaAction(prueba.id);
    if (error) {
      setError(error);
      return;
    }
    load();
  };

  const cardClass = `rounded-xl border p-5 ${isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'}`;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1
                className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Mis pruebas técnicas
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                Beta
              </span>
            </div>
            <p
              className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Armá tus propias pruebas técnicas e invitá candidatos a rendirlas
              por link.
            </p>
          </div>
          <Link
            href="/empresa/pruebas/nuevo"
            className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0"
          >
            + Nueva prueba
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p
            className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Cargando...
          </p>
        ) : pruebas.length === 0 ? (
          <div className={cardClass}>
            <p
              className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              Todavía no creaste ninguna prueba.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pruebas.map((prueba) => (
              <div key={prueba.id} className={cardClass}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/empresa/pruebas/${prueba.id}`}
                        className={`font-semibold hover:underline ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {prueba.title}
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          prueba.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {prueba.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      {prueba.category}
                      {prueba.level ? ` · ${prueba.level}` : ''}
                      {prueba.duration_minutes
                        ? ` · ${prueba.duration_minutes} min`
                        : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap text-sm">
                    <Link
                      href={`/empresa/pruebas/${prueba.id}`}
                      className={`px-3 py-1.5 rounded-lg border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:border-slate-500' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                    >
                      Preguntas
                    </Link>
                    <Link
                      href={`/empresa/pruebas/${prueba.id}/invitaciones`}
                      className={`px-3 py-1.5 rounded-lg border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:border-slate-500' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                    >
                      Invitaciones
                    </Link>
                    <Link
                      href={`/empresa/pruebas/${prueba.id}/resultados`}
                      className={`px-3 py-1.5 rounded-lg border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:border-slate-500' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                    >
                      Resultados
                    </Link>
                    <button
                      onClick={() => handleToggle(prueba)}
                      className={`px-3 py-1.5 rounded-lg border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:border-slate-500' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                    >
                      {prueba.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(prueba)}
                      className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Eliminar
                    </button>
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
