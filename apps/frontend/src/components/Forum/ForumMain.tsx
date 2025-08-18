'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import forumService, { Thread, ForumFilters } from '../../services/forumService';
import ForumThreadList from './ForumThreadList';
import ForumCreateThread from './ForumCreateThread';
import ForumFiltersComponent from './ForumFiltersComponent';
import ForumStats from './ForumStats';

export default function ForumMain() {
  const { user, isAuthenticated } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<ForumFilters>({
    sortBy: 'newest',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const loadThreads = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await forumService.getThreads(filters);
      
      if (response.success && response.data) {
        setThreads(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        console.error('Error cargando threads:', response.error);
      }
    } catch (error) {
      console.error('Error cargando threads:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadThreads();
  }, [filters, loadThreads]);

  const handleCreateThread = async (threadData: any) => {
    try {
      const response = await forumService.createThread(threadData);
      if (response.success) {
        setShowCreateForm(false);
        loadThreads(); // Recargar threads
        return { success: true };
      } else {
        return { success: false, message: response.error };
      }
    } catch (error) {
      console.error('Error creando thread:', error);
      return { success: false, message: 'Error inesperado' };
    }
  };

  const handleFiltersChange = (newFilters: Partial<ForumFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Resetear a primera página
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleThreadDeleted = () => {
    loadThreads(); // Recargar threads después de eliminar
  };

  return (
    <div className="min-h-screen bg-brand-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-4">
            🗨️ Foro de la Comunidad
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Conecta con otros profesionales, comparte conocimientos y resuelve dudas en nuestro foro comunitario.
          </p>
        </div>

        {/* Estadísticas */}
        <ForumStats />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar con filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <ForumFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {/* Botón crear thread */}
            {isAuthenticated && (
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-brand-accent hover:bg-brand-primary text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {showCreateForm ? '❌ Cancelar' : '✏️ Crear Nuevo Thread'}
                </button>
              </div>
            )}

            {/* Formulario crear thread */}
            {showCreateForm && isAuthenticated && (
              <div className="mb-8">
                <ForumCreateThread
                  onSubmit={handleCreateThread}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            )}

            {/* Lista de threads */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
                <p className="text-brand-muted">Cargando threads...</p>
              </div>
            ) : (
              <>
                <ForumThreadList
                  threads={threads}
                  onThreadDeleted={handleThreadDeleted}
                  currentUser={user}
                />

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        ← Anterior
                      </button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg border ${
                            page === pagination.page
                              ? 'bg-brand-accent text-white border-brand-accent'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Siguiente →
                      </button>
                    </nav>
                  </div>
                )}

                {/* Mensaje si no hay threads */}
                {threads.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-brand-text mb-2">
                      No hay threads disponibles
                    </h3>
                    <p className="text-brand-muted">
                      {isAuthenticated 
                        ? '¡Sé el primero en crear un thread!' 
                        : 'Inicia sesión para crear el primer thread'
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
