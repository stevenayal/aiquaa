'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import type { Idea } from '@/services/ideasBoardService';
import { IdeaVoteButtons } from './IdeaVoteButtons';

interface IdeaCardProps {
  idea: Idea;
  onVoteChange: () => void;
}

const statusColors = {
  PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Pendiente' },
  APPROVED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'Aprobada' },
  IN_PROGRESS: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', label: 'En Progreso' },
  COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Completada' },
  REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Rechazada' },
};

export function IdeaCard({ idea, onVoteChange }: IdeaCardProps) {
  const { isDarkMode } = useTheme();

  const statusStyle = statusColors[idea.status];
  const createdDate = new Date(idea.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={`rounded-lg shadow-md transition-all hover:shadow-lg ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}
    >
      <div className="flex gap-4 p-4">
        {/* Voting */}
        <div className="flex-shrink-0">
          <IdeaVoteButtons idea={idea} onVoteChange={onVoteChange} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <Link
              href={`/ideas-board/${idea.id}`}
              className={`text-lg font-semibold hover:underline ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}
            >
              {idea.title}
            </Link>
          </div>

          <p
            className={`text-sm mb-3 line-clamp-2 ${
              isDarkMode ? 'text-slate-300' : 'text-gray-600'
            }`}
          >
            {idea.description}
          </p>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Category */}
            <div className="flex items-center gap-1">
              <span className="text-lg">{idea.category.icon}</span>
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
                {idea.category.name}
              </span>
            </div>

            {/* Status */}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
            >
              {statusStyle.label}
            </span>

            {/* Tags */}
            {idea.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-full text-xs ${
                  isDarkMode
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                #{tag}
              </span>
            ))}

            {/* Separator */}
            <span className={isDarkMode ? 'text-slate-600' : 'text-gray-300'}>
              •
            </span>

            {/* Author */}
            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
              por {idea.author.name || 'Usuario'}
            </span>

            {/* Date */}
            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
              {createdDate}
            </span>
          </div>

          {/* Footer stats */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div
              className={`flex items-center gap-1 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{idea._count?.comments || 0}</span>
            </div>

            <div
              className={`flex items-center gap-1 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{idea.viewCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
