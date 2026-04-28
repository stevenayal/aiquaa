'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';

type ExamResult = {
  id: string;
  participant_name: string | null;
  participant_email: string | null;
  exam_type: string;
  score: number;
  percentage: number;
  passed: boolean;
  time_spent: number;
  created_at: string;
  process_code: string | null;
};

type HiringProcess = {
  id: string;
  code: string;
  position_name: string;
  status: string;
};

export default function CandidatosPage() {
  const { isDarkMode } = useTheme();
  const [processes, setProcesses] = useState<HiringProcess[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const [{ data: procs }, { data: res }] = await Promise.all([
        supabase.from('hiring_processes').select('id, code, position_name, status').order('created_at', { ascending: false }),
        supabase
          .from('exam_results')
          .select('id, participant_name, participant_email, exam_type, score, percentage, passed, time_spent, created_at, process_code')
          .not('process_code', 'is', null)
          .order('created_at', { ascending: false }),
      ]);

      // Filter results to only those whose process_code belongs to this employer
      const myCodes = new Set((procs ?? []).map(p => p.code));
      const myResults = (res ?? []).filter(r => r.process_code && myCodes.has(r.process_code));

      setProcesses(procs ?? []);
      setResults(myResults);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = selectedCode === 'all'
    ? results
    : results.filter(r => r.process_code === selectedCode);

  const mins = (secs: number) => `${Math.floor(secs / 60)}m ${secs % 60}s`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Candidatos
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Resultados de exámenes técnicos por proceso
            </p>
          </div>
        </div>

        {/* Filter by process */}
        {processes.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setSelectedCode('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCode === 'all'
                  ? 'bg-indigo-600 text-white'
                  : (isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
              }`}
            >
              Todos
            </button>
            {processes.map(p => (
              <button
                key={p.code}
                onClick={() => setSelectedCode(p.code)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCode === p.code
                    ? 'bg-indigo-600 text-white'
                    : (isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                }`}
              >
                {p.position_name} <span className="opacity-60">({p.code})</span>
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
            Cargando...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className={`text-center py-16 rounded-xl border-2 border-dashed ${
            isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'
          }`}>
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium mb-1">Sin resultados todavía</p>
            <p className="text-sm">Compartí el código del proceso con tus candidatos para que rindan los exámenes</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}>
                  {['Candidato', 'Examen', 'Proceso', 'Puntaje', 'Tiempo', 'Fecha'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-t transition-colors ${
                      isDarkMode
                        ? `border-slate-700 ${i % 2 === 0 ? 'bg-dark-secondary' : 'bg-slate-800/50'}`
                        : `border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {r.participant_name || '—'}
                      </div>
                      {r.participant_email && (
                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {r.participant_email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                        {r.exam_type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {r.process_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${r.passed ? 'text-green-500' : 'text-red-500'}`}>
                          {r.percentage}%
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                          ({r.score} pts)
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {mins(r.time_spent)}
                    </td>
                    <td className={`px-4 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {new Date(r.created_at).toLocaleDateString('es-PY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <Link href="/empresa" className={`text-sm ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
            ← Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
