'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { SuruFloating } from '@/components/Suru';
import { ideasBoardService, type Idea, type IdeaCategory } from '@/services/ideasBoardService';
import { IdeaCard } from './components/IdeaCard';
import { IdeaFilters } from './components/IdeaFilters';

export default function IdeasBoardPage() {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useSupabaseAuth();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<IdeaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState('topVoted');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ideasBoardService.getIdeas({
        categoryId: selectedCategory || undefined,
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
        orderBy: orderBy as any,
        page: currentPage,
        limit: 20,
      });

      setIdeas(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setError('Error al cargar las ideas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await ideasBoardService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedStatus, orderBy, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchIdeas();
  };

  const handleVoteChange = () => {
    fetchIdeas();
  };

  return (
    <div
      className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
      }`}
    >
      <SuruFloating />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white mb-6 text-4xl">
            💡
          </div>
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}
          >
            Ideas Board
          </h1>
          <p
            className={`text-xl max-w-3xl mx-auto mb-6 ${
              isDarkMode ? 'text-slate-300' : 'text-brand-muted'
            }`}
          >
            Propone nuevas herramientas, mejoras y features para AIQUAA. Vota por tus favoritas y ayuda a dar forma al futuro de la plataforma.
          </p>

          {isAuthenticated && (
            <Link
              href="/ideas-board/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nueva Idea
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ideas..."
                className={`w-full px-4 py-3 pl-12 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              />
              <svg
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-400'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <IdeaFilters
              categories={categories}
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              orderBy={orderBy}
              onCategoryChange={setSelectedCategory}
              onStatusChange={setSelectedStatus}
              onOrderByChange={setOrderBy}
            />
          </aside>

          {/* Ideas List */}
          <main className="lg:col-span-3">
            {/* Results count */}
            <div
              className={`mb-4 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}
            >
              {total > 0 ? (
                <span>
                  Mostrando {ideas.length} de {total} ideas
                </span>
              ) : (
                <span>No se encontraron ideas</span>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className={`p-4 rounded-lg mb-4 ${
                  isDarkMode
                    ? 'bg-red-900/30 text-red-300'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {error}
              </div>
            )}

            {/* Ideas */}
            {!loading && !error && ideas.length > 0 && (
              <div className="space-y-4">
                {ideas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onVoteChange={handleVoteChange}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && ideas.length === 0 && (
              <div
                className={`text-center py-12 rounded-lg ${
                  isDarkMode ? 'bg-slate-800' : 'bg-white'
                }`}
              >
                <div className="text-6xl mb-4">💡</div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}
                >
                  No hay ideas aún
                </h3>
                <p
                  className={`mb-4 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}
                >
                  Sé el primero en proponer una idea
                </p>
                {isAuthenticated && (
                  <Link
                    href="/ideas-board/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all"
                  >
                    Nueva Idea
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Anterior
                </button>

                <span
                  className={`px-4 py-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}
                >
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
