'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { SuruFloating } from '@/components/Suru';
import { ideasBoardService, type IdeaCategory } from '@/services/ideasBoardService';

export default function CreateIdeaPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useSupabaseAuth();

  const [categories, setCategories] = useState<IdeaCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tagsInput, setTagsInput] = useState('');

  // Validation errors
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/ideas-board/create');
      return;
    }

    fetchCategories();
  }, [isAuthenticated, router]);

  const fetchCategories = async () => {
    try {
      const cats = await ideasBoardService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error al cargar las categorías');
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate title
    if (title.length < 10) {
      setTitleError('El título debe tener al menos 10 caracteres');
      isValid = false;
    } else if (title.length > 200) {
      setTitleError('El título no puede exceder 200 caracteres');
      isValid = false;
    } else {
      setTitleError('');
    }

    // Validate description
    if (description.length < 50) {
      setDescriptionError('La descripción debe tener al menos 50 caracteres');
      isValid = false;
    } else {
      setDescriptionError('');
    }

    // Validate category
    if (!categoryId) {
      setCategoryError('Debes seleccionar una categoría');
      isValid = false;
    } else {
      setCategoryError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse tags
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const newIdea = await ideasBoardService.createIdea({
        title,
        description,
        categoryId: categoryId!,
        tags: tags.length > 0 ? tags : undefined,
      });

      // Redirect to the new idea's detail page
      router.push(`/ideas-board/${newIdea.id}`);
    } catch (err: any) {
      console.error('Error creating idea:', err);
      setError(err.message || 'Error al crear la idea. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
      }`}
    >
      <SuruFloating />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/ideas-board"
            className={`inline-flex items-center gap-2 mb-4 text-sm hover:underline ${
              isDarkMode ? 'text-slate-300' : 'text-gray-600'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al Ideas Board
          </Link>

          <h1
            className={`text-3xl md:text-4xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}
          >
            Proponer Nueva Idea
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? 'text-slate-300' : 'text-brand-muted'
            }`}
          >
            Comparte tu idea para mejorar AIQUAA
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              isDarkMode
                ? 'bg-red-900/30 text-red-300'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`rounded-lg shadow-md p-6 md:p-8 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}
        >
          {/* Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Ej: Generador de casos de prueba con IA"
              className={`w-full px-4 py-3 rounded-lg border ${
                titleError
                  ? 'border-red-500'
                  : isDarkMode
                  ? 'border-slate-600'
                  : 'border-gray-300'
              } ${
                isDarkMode
                  ? 'bg-slate-700 text-white placeholder-slate-400'
                  : 'bg-white text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
            <div className="flex justify-between items-center mt-1">
              {titleError ? (
                <span className="text-sm text-red-500">{titleError}</span>
              ) : (
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  Mínimo 10 caracteres
                </span>
              )}
              <span
                className={`text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                {title.length}/200
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Describe tu idea en detalle. ¿Qué problema resuelve? ¿Cómo beneficiaría a la comunidad?"
              className={`w-full px-4 py-3 rounded-lg border ${
                descriptionError
                  ? 'border-red-500'
                  : isDarkMode
                  ? 'border-slate-600'
                  : 'border-gray-300'
              } ${
                isDarkMode
                  ? 'bg-slate-700 text-white placeholder-slate-400'
                  : 'bg-white text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none`}
            />
            {descriptionError ? (
              <span className="text-sm text-red-500 mt-1">
                {descriptionError}
              </span>
            ) : (
              <span
                className={`text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                } mt-1`}
              >
                Mínimo 50 caracteres ({description.length}/50)
              </span>
            )}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label
              htmlFor="category"
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={categoryId || ''}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
              className={`w-full px-4 py-3 rounded-lg border ${
                categoryError
                  ? 'border-red-500'
                  : isDarkMode
                  ? 'border-slate-600'
                  : 'border-gray-300'
              } ${
                isDarkMode
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {categoryError && (
              <span className="text-sm text-red-500 mt-1">{categoryError}</span>
            )}
          </div>

          {/* Tags */}
          <div className="mb-8">
            <label
              htmlFor="tags"
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              Etiquetas (opcional)
            </label>
            <input
              type="text"
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="automatización, performance, api (separadas por comas)"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
            <span
              className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              } mt-1`}
            >
              Separa las etiquetas con comas
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Publicar Idea'}
            </button>
            <Link
              href="/ideas-board"
              className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
