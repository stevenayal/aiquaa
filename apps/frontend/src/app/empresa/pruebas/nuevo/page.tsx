'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  createPruebaAction,
  listCategoriasAction,
} from '@/actions/empresa-pruebas';

export default function NuevaPruebaPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCategoriasAction().then(({ data }) => setCategorias(data));
  }, []);

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory =
      category === '__new__' ? newCategory.trim() : category;
    if (!title.trim() || !finalCategory) {
      setError('Título y categoría son requeridos.');
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await createPruebaAction({
      title: title.trim(),
      category: finalCategory,
      description: description.trim() || undefined,
      level: level.trim() || undefined,
      duration_minutes: durationMinutes === '' ? undefined : durationMinutes,
    });

    setLoading(false);
    if (error || !data) {
      setError(error ?? 'No se pudo crear la prueba.');
      return;
    }

    router.push(`/empresa/pruebas/${data.id}`);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Nueva prueba técnica
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Definí los datos generales. Después agregás las preguntas.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-xl border p-6 space-y-6 ${isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'}`}
        >
          <div>
            <label className={labelClass}>Título *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="ej. QA Analyst - Prueba técnica"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          <div>
            <label className={labelClass}>Categoría *</label>
            <select
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">— Seleccioná —</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__new__">+ Crear nueva categoría</option>
            </select>
            {category === '__new__' && (
              <input
                type="text"
                className={`${inputClass} mt-2`}
                placeholder="Nombre de la categoría"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                maxLength={60}
              />
            )}
          </div>

          <div>
            <label className={labelClass}>
              Descripción{' '}
              <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>
                (opcional)
              </span>
            </label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Nivel{' '}
                <span
                  className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}
                >
                  (opcional)
                </span>
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="ej. Junior"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                maxLength={60}
              />
            </div>
            <div>
              <label className={labelClass}>
                Duración (min){' '}
                <span
                  className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}
                >
                  (opcional)
                </span>
              </label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear prueba'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/empresa/pruebas')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
