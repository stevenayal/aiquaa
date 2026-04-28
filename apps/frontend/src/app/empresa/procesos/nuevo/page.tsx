'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';

const EXAM_OPTIONS = [
  { id: 'istqb',       label: 'ISTQB — Fundamentos de QA' },
  { id: 'git',         label: 'Git — Control de versiones' },
  { id: 'performance', label: 'Performance — Pruebas de carga' },
];

function generateCode(positionName: string): string {
  const slug = positionName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('-');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${slug}-${rand}`;
}

export default function NuevoProcesoPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const [positionName, setPositionName] = useState('');
  const [description, setDescription] = useState('');
  const [examTypes, setExamTypes] = useState<string[]>(['istqb', 'git', 'performance']);
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleExam = (id: string) => {
    setExamTypes(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionName.trim()) return;
    if (examTypes.length === 0) {
      setError('Seleccioná al menos un tipo de examen.');
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }

    const code = generateCode(positionName);
    const { error: insertError } = await supabase
      .from('hiring_processes')
      .insert({
        code,
        created_by: user.id,
        company_name: user.user_metadata?.company_name ?? '',
        position_name: positionName.trim(),
        description: description.trim() || null,
        exam_types: examTypes,
        status,
        expires_at: expiresAt || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/empresa/procesos');
  };

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Nuevo proceso de selección
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Creá un proceso y compartí el código con los candidatos para que rindan los exámenes
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-xl border p-6 space-y-6 ${
            isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'
          }`}
        >
          {/* Position name */}
          <div>
            <label className={labelClass}>Puesto / posición *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="ej. QA Analyst Jr."
              value={positionName}
              onChange={e => setPositionName(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Descripción <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>(opcional)</span></label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Describí brevemente el proceso o los requisitos del puesto"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Exam types */}
          <div>
            <label className={labelClass}>Exámenes a rendir *</label>
            <div className="space-y-2">
              {EXAM_OPTIONS.map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                    examTypes.includes(opt.id)
                      ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/30' : 'border-indigo-400 bg-indigo-50')
                      : (isDarkMode ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300')
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-indigo-600 w-4 h-4"
                    checked={examTypes.includes(opt.id)}
                    onChange={() => toggleExam(opt.id)}
                  />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Expires at */}
          <div>
            <label className={labelClass}>Fecha de vencimiento <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>(opcional)</span></label>
            <input
              type="date"
              className={inputClass}
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Estado inicial</label>
            <div className="flex gap-3">
              {(['active', 'draft'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    status === s
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : (isDarkMode ? 'border-slate-600 text-slate-300 hover:border-slate-500' : 'border-gray-300 text-gray-700 hover:border-gray-400')
                  }`}
                >
                  {s === 'active' ? '✅ Activo (candidatos pueden rendir)' : '📝 Borrador (guardado, no visible)'}
                </button>
              ))}
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
              disabled={loading || !positionName.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear proceso'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/empresa/procesos')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancelar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
