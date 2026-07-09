'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getPruebaAction,
  listPreguntasAction,
  upsertPreguntaAction,
  deletePreguntaAction,
  reorderPreguntasAction,
  type EmpresaPrueba,
  type EmpresaPreguntaRow,
  type EmpresaPruebaQuestionType,
} from '@/actions/empresa-pruebas';

const QUESTION_TYPE_LABELS: Record<EmpresaPruebaQuestionType, string> = {
  multiple_choice: 'Opción múltiple',
  true_false: 'Verdadero / Falso',
  short_text: 'Respuesta corta',
};

function emptyForm() {
  return {
    id: undefined as string | undefined,
    question_type: 'multiple_choice' as EmpresaPruebaQuestionType,
    prompt: '',
    options: ['', ''],
    correctOptionIndex: 0,
    correctBool: true,
    keywords: '',
    points: 1,
  };
}

export default function EditorPreguntasPage() {
  const { isDarkMode } = useTheme();
  const params = useParams<{ pruebaId: string }>();
  const pruebaId = params.pruebaId;

  const [prueba, setPrueba] = useState<EmpresaPrueba | null>(null);
  const [preguntas, setPreguntas] = useState<EmpresaPreguntaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      getPruebaAction(pruebaId),
      listPreguntasAction(pruebaId),
    ]).then(([pruebaRes, preguntasRes]) => {
      setPrueba(pruebaRes.data);
      setPreguntas(preguntasRes.data ?? []);
      setError(pruebaRes.error ?? preguntasRes.error);
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

  const startEdit = (pregunta: EmpresaPreguntaRow) => {
    if (pregunta.question_type === 'multiple_choice') {
      const options = (
        (pregunta.options as string[] | null) ?? ['', '']
      ).slice();
      const correctValue =
        (pregunta.correct_answer as { value?: string } | null)?.value ?? '';
      setForm({
        id: pregunta.id,
        question_type: 'multiple_choice',
        prompt: pregunta.prompt,
        options: options.length >= 2 ? options : [...options, ''],
        correctOptionIndex: Math.max(0, options.indexOf(correctValue)),
        correctBool: true,
        keywords: '',
        points: pregunta.points,
      });
    } else if (pregunta.question_type === 'true_false') {
      setForm({
        id: pregunta.id,
        question_type: 'true_false',
        prompt: pregunta.prompt,
        options: ['', ''],
        correctOptionIndex: 0,
        correctBool: Boolean(
          (pregunta.correct_answer as { value?: boolean } | null)?.value
        ),
        keywords: '',
        points: pregunta.points,
      });
    } else {
      setForm({
        id: pregunta.id,
        question_type: 'short_text',
        prompt: pregunta.prompt,
        options: ['', ''],
        correctOptionIndex: 0,
        correctBool: true,
        keywords: (pregunta.expected_keywords ?? []).join(', '),
        points: pregunta.points,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prompt.trim()) {
      setError('El enunciado es requerido.');
      return;
    }

    let correct_answer: unknown;
    let options: unknown;
    let expected_keywords: string[] | undefined;

    if (form.question_type === 'multiple_choice') {
      const cleanOptions = form.options.map((o) => o.trim()).filter(Boolean);
      if (cleanOptions.length < 2) {
        setError('Agregá al menos 2 opciones.');
        return;
      }
      options = cleanOptions;
      correct_answer = {
        value: cleanOptions[form.correctOptionIndex] ?? cleanOptions[0],
      };
    } else if (form.question_type === 'true_false') {
      correct_answer = { value: form.correctBool };
    } else {
      expected_keywords = form.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      if (expected_keywords.length === 0) {
        setError('Agregá al menos una palabra clave esperada.');
        return;
      }
      correct_answer = { keywords: expected_keywords };
    }

    setSaving(true);
    setError(null);

    const { error } = await upsertPreguntaAction({
      id: form.id,
      prueba_id: pruebaId,
      position: form.id
        ? (preguntas.find((p) => p.id === form.id)?.position ??
          preguntas.length)
        : preguntas.length,
      question_type: form.question_type,
      prompt: form.prompt.trim(),
      options,
      correct_answer,
      expected_keywords,
      points: form.points,
    });

    setSaving(false);
    if (error) {
      setError(error);
      return;
    }

    setForm(emptyForm());
    load();
  };

  const handleDelete = async (pregunta: EmpresaPreguntaRow) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    const { error } = await deletePreguntaAction(pregunta.id, pruebaId);
    if (error) {
      setError(error);
      return;
    }
    load();
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= preguntas.length) return;
    const reordered = preguntas.slice();
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    setPreguntas(reordered);
    const { error } = await reorderPreguntasAction(
      pruebaId,
      reordered.map((p) => p.id)
    );
    if (error) {
      setError(error);
      load();
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className="max-w-3xl mx-auto px-4 py-12">
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/empresa/pruebas"
            className={`text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
          >
            ← Mis pruebas
          </Link>
          <h1
            className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {prueba?.title ?? 'Prueba'}
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            {preguntas.length} pregunta{preguntas.length === 1 ? '' : 's'}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-8">
          {preguntas.map((pregunta, index) => (
            <div key={pregunta.id} className={cardClass}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                  >
                    {QUESTION_TYPE_LABELS[pregunta.question_type]} ·{' '}
                    {pregunta.points} pt
                    {pregunta.points === 1 ? '' : 's'}
                  </span>
                  <p
                    className={`text-sm mt-1 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                  >
                    {pregunta.prompt}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className={`px-2 py-1 rounded border text-xs disabled:opacity-30 ${isDarkMode ? 'border-slate-600 text-slate-300' : 'border-gray-300 text-gray-600'}`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={index === preguntas.length - 1}
                    className={`px-2 py-1 rounded border text-xs disabled:opacity-30 ${isDarkMode ? 'border-slate-600 text-slate-300' : 'border-gray-300 text-gray-600'}`}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => startEdit(pregunta)}
                    className={`px-2 py-1 rounded border text-xs ${isDarkMode ? 'border-slate-600 text-slate-300' : 'border-gray-300 text-gray-600'}`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(pregunta)}
                    className="px-2 py-1 rounded border border-red-300 text-red-600 text-xs hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
          <h2
            className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {form.id ? 'Editar pregunta' : 'Agregar pregunta'}
          </h2>

          <div>
            <label className={labelClass}>Tipo</label>
            <select
              className={inputClass}
              value={form.question_type}
              onChange={(e) =>
                setForm({
                  ...emptyForm(),
                  question_type: e.target.value as EmpresaPruebaQuestionType,
                })
              }
            >
              <option value="multiple_choice">Opción múltiple</option>
              <option value="true_false">Verdadero / Falso</option>
              <option value="short_text">Respuesta corta</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Enunciado *</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            />
          </div>

          {form.question_type === 'multiple_choice' && (
            <div>
              <label className={labelClass}>Opciones (marcá la correcta)</label>
              <div className="space-y-2">
                {form.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={form.correctOptionIndex === index}
                      onChange={() =>
                        setForm({ ...form, correctOptionIndex: index })
                      }
                    />
                    <input
                      type="text"
                      className={inputClass}
                      placeholder={`Opción ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const options = form.options.slice();
                        options[index] = e.target.value;
                        setForm({ ...form, options });
                      }}
                    />
                    {form.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            options: form.options.filter((_, i) => i !== index),
                          })
                        }
                        className="text-red-500 text-xs shrink-0"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, options: [...form.options, ''] })
                }
                className={`text-xs mt-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
              >
                + Agregar opción
              </button>
            </div>
          )}

          {form.question_type === 'true_false' && (
            <div>
              <label className={labelClass}>Respuesta correcta</label>
              <div className="flex gap-3">
                {[true, false].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => setForm({ ...form, correctBool: value })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.correctBool === value
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : isDarkMode
                          ? 'border-slate-600 text-slate-300'
                          : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {value ? 'Verdadero' : 'Falso'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.question_type === 'short_text' && (
            <div>
              <label className={labelClass}>
                Palabras clave esperadas (separadas por coma)
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="ej. regresión, smoke test, automatización"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              />
              <p
                className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Se califica por coincidencia de palabras clave — recomendado
                revisar manualmente en Resultados.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>Puntos</label>
            <input
              type="number"
              min={1}
              className={`${inputClass} w-24`}
              value={form.points}
              onChange={(e) =>
                setForm({ ...form, points: Number(e.target.value) || 1 })
              }
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving
                ? 'Guardando...'
                : form.id
                  ? 'Guardar cambios'
                  : 'Agregar pregunta'}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(emptyForm())}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
