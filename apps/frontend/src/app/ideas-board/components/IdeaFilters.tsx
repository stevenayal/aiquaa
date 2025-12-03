'use client';

import { useTheme } from '@/contexts/ThemeContext';
import type { IdeaCategory } from '@/services/ideasBoardService';

interface IdeaFiltersProps {
  categories: IdeaCategory[];
  selectedCategory: number | null;
  selectedStatus: string | null;
  orderBy: string;
  onCategoryChange: (categoryId: number | null) => void;
  onStatusChange: (status: string | null) => void;
  onOrderByChange: (orderBy: string) => void;
}

const statuses = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobada' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completada' },
];

const orderOptions = [
  { value: 'topVoted', label: 'Más votadas' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguas' },
  { value: 'trending', label: 'En tendencia' },
];

export function IdeaFilters({
  categories,
  selectedCategory,
  selectedStatus,
  orderBy,
  onCategoryChange,
  onStatusChange,
  onOrderByChange,
}: IdeaFiltersProps) {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`rounded-lg shadow-md p-6 ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-brand-text'
        }`}
      >
        Filtros
      </h3>

      {/* Order By */}
      <div className="mb-6">
        <label
          className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-slate-300' : 'text-gray-700'
          }`}
        >
          Ordenar por
        </label>
        <select
          value={orderBy}
          onChange={(e) => onOrderByChange(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
        >
          {orderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label
          className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-slate-300' : 'text-gray-700'
          }`}
        >
          Categoría
        </label>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === null
                ? isDarkMode
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-500 text-white'
                : isDarkMode
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas las categorías
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? isDarkMode
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-500 text-white'
                  : isDarkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="flex-1">{category.name}</span>
              {category._count && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === category.id
                      ? 'bg-white/20'
                      : isDarkMode
                      ? 'bg-slate-600'
                      : 'bg-gray-200'
                  }`}
                >
                  {category._count.ideas}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-slate-300' : 'text-gray-700'
          }`}
        >
          Estado
        </label>
        <select
          value={selectedStatus || ''}
          onChange={(e) => onStatusChange(e.target.value || null)}
          className={`w-full px-3 py-2 rounded-lg border ${
            isDarkMode
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
