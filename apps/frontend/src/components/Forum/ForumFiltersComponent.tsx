'use client';

import React, { useState, useEffect } from 'react';
import { ForumFilters } from '../../services/forumService';
import forumService from '../../services/forumService';

interface ForumFiltersComponentProps {
  // eslint-disable-next-line no-unused-vars
  filters: ForumFilters;
  onFiltersChange: (filters: Partial<ForumFilters>) => void;
}

export default function ForumFiltersComponent({ filters, onFiltersChange }: ForumFiltersComponentProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await forumService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await forumService.getTags();
      if (response.success && response.data) {
        setTags(response.data);
      }
    } catch (error) {
      console.error('Error cargando tags:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange({ search: value || undefined });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ category: category === 'all' ? undefined : category });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const handleSortChange = (sortBy: ForumFilters['sortBy']) => {
    onFiltersChange({ sortBy });
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFiltersChange({
      search: undefined,
      category: undefined,
      tags: undefined,
      sortBy: 'newest',
    });
  };

  const hasActiveFilters = filters.search || filters.category || (filters.tags && filters.tags.length > 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-brand-text">Filtros</h3>

      {/* Búsqueda */}
      <div>
        <label className="block text-sm font-medium text-brand-text mb-2">
          🔍 Buscar
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar en threads..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm"
        />
      </div>

      {/* Categorías */}
      <div>
        <label className="block text-sm font-medium text-brand-text mb-2">
          📂 Categorías
        </label>
        <select
          value={filters.category || 'all'}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-brand-text mb-2">
          🏷️ Tags
        </label>
        <div className="max-h-32 overflow-y-auto space-y-2">
          {tags.slice(0, 20).map((tag) => (
            <label key={tag} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.tags?.includes(tag) || false}
                onChange={() => handleTagToggle(tag)}
                className="w-4 h-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
              />
              <span className="text-sm text-brand-text">#{tag}</span>
            </label>
          ))}
        </div>
        {tags.length > 20 && (
          <p className="text-xs text-brand-muted mt-2">
            Mostrando 20 de {tags.length} tags
          </p>
        )}
      </div>

      {/* Ordenamiento */}
      <div>
        <label className="block text-sm font-medium text-brand-text mb-2">
          📊 Ordenar por
        </label>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => handleSortChange(e.target.value as ForumFilters['sortBy'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="mostViewed">Más vistos</option>
          <option value="mostReplied">Más respondidos</option>
        </select>
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <div>
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
          >
            🗑️ Limpiar Filtros
          </button>
        </div>
      )}

      {/* Información de filtros activos */}
      {hasActiveFilters && (
        <div className="p-3 bg-brand-accent/10 rounded-lg">
          <h4 className="text-sm font-medium text-brand-text mb-2">Filtros activos:</h4>
          <div className="space-y-1 text-xs text-brand-muted">
            {filters.search && (
              <div>🔍 Búsqueda: &quot;{filters.search}&quot;</div>
            )}
            {filters.category && (
              <div>📂 Categoría: {filters.category}</div>
            )}
            {filters.tags && filters.tags.length > 0 && (
              <div>🏷️ Tags: {filters.tags.join(', ')}</div>
            )}
            {filters.sortBy && (
              <div>📊 Orden: {filters.sortBy === 'newest' ? 'Más recientes' : 
                               filters.sortBy === 'oldest' ? 'Más antiguos' :
                               filters.sortBy === 'mostViewed' ? 'Más vistos' : 'Más respondidos'}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
