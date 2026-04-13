'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ForumFilters } from '../../services/forumService';
import forumService from '../../services/forumService';

interface ForumFiltersComponentProps {
  filters: ForumFilters;
  onFiltersChange: (filters: Partial<ForumFilters>) => void;
}

export default function ForumFiltersComponent({ filters, onFiltersChange }: ForumFiltersComponentProps) {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
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

  const labelClass = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-brand-text'}`;
  const inputClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400'
      : 'bg-white border-gray-300 text-brand-text'
  }`;
  const mutedClass = isDarkMode ? 'text-slate-400' : 'text-brand-muted';

  return (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-brand-text'}`}>{t('forum.filters.title')}</h3>

      <div>
        <label className={labelClass}>{t('forum.filters.search')}</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('forum.filters.searchPlaceholder')}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>{t('forum.filters.categories')}</label>
        <select
          value={filters.category || 'all'}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className={inputClass}
        >
          <option value="all">{t('forum.filters.allCategories')}</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>{t('forum.filters.tags')}</label>
        <div className="max-h-32 overflow-y-auto space-y-2">
          {tags.slice(0, 20).map((tag) => (
            <label key={tag} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.tags?.includes(tag) || false}
                onChange={() => handleTagToggle(tag)}
                className="w-4 h-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
              />
              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-brand-text'}`}>#{tag}</span>
            </label>
          ))}
        </div>
        {tags.length > 20 && (
          <p className={`text-xs mt-2 ${mutedClass}`}>{t('forum.filters.showing').replace('{count}', String(tags.length))}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>{t('forum.filters.sortBy')}</label>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => handleSortChange(e.target.value as ForumFilters['sortBy'])}
          className={inputClass}
        >
          <option value="newest">{t('forum.filters.newest')}</option>
          <option value="oldest">{t('forum.filters.oldest')}</option>
          <option value="mostViewed">{t('forum.filters.mostViewed')}</option>
          <option value="mostReplied">{t('forum.filters.mostReplied')}</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
            isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {t('forum.filters.clear')}
        </button>
      )}

      {hasActiveFilters && (
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-brand-accent/10'}`}>
          <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-brand-text'}`}>{t('forum.filters.active')}</h4>
          <div className={`space-y-1 text-xs ${mutedClass}`}>
            {filters.search && <div>🔍 &quot;{filters.search}&quot;</div>}
            {filters.category && <div>📂 {filters.category}</div>}
            {filters.tags && filters.tags.length > 0 && <div>🏷️ {filters.tags.join(', ')}</div>}
            {filters.sortBy && (
              <div>📊 {
                filters.sortBy === 'newest' ? t('forum.filters.newest') :
                filters.sortBy === 'oldest' ? t('forum.filters.oldest') :
                filters.sortBy === 'mostViewed' ? t('forum.filters.mostViewed') : t('forum.filters.mostReplied')
              }</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
