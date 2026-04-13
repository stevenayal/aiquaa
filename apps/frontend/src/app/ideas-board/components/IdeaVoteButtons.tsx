'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { ideasBoardService, type Idea } from '@/services/ideasBoardService';
import { useTheme } from '@/contexts/ThemeContext';

interface IdeaVoteButtonsProps {
  idea: Idea;
  onVoteChange: () => void;
  size?: 'small' | 'large';
}

export function IdeaVoteButtons({
  idea,
  onVoteChange,
  size = 'small',
}: IdeaVoteButtonsProps) {
  const { isAuthenticated } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (value: 1 | -1) => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para votar');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setIsVoting(true);
      setError(null);

      // Si ya votó con el mismo valor, quitar voto
      if (idea.userVote === value) {
        await ideasBoardService.removeVote(idea.id);
      } else {
        await ideasBoardService.voteIdea(idea.id, value);
      }

      onVoteChange();
    } catch (err) {
      console.error('Error voting:', err);
      setError('Error al votar. Intenta de nuevo.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsVoting(false);
    }
  };

  const isSmall = size === 'small';

  return (
    <div className="flex flex-col items-center gap-1 relative">
      {error && (
        <div
          className={`absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-3 py-1 text-xs rounded ${
            isDarkMode
              ? 'bg-red-900 text-red-200'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {error}
        </div>
      )}

      <button
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={`${
          isSmall ? 'p-1.5' : 'p-2'
        } rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          idea.userVote === 1
            ? isDarkMode
              ? 'bg-green-600 text-white'
              : 'bg-green-500 text-white'
            : isDarkMode
            ? 'bg-slate-700 hover:bg-green-600/50 text-slate-300'
            : 'bg-gray-100 hover:bg-green-100 text-gray-600'
        }`}
        title="Upvote"
      >
        <svg
          className={isSmall ? 'w-4 h-4' : 'w-5 h-5'}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 3l7 7H3l7-7z" />
        </svg>
      </button>

      <div
        className={`${
          isSmall ? 'text-base' : 'text-xl'
        } font-bold transition-colors ${
          idea.voteScore > 0
            ? 'text-green-600'
            : idea.voteScore < 0
            ? 'text-red-600'
            : isDarkMode
            ? 'text-slate-400'
            : 'text-gray-600'
        }`}
      >
        {idea.voteScore}
      </div>

      <button
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={`${
          isSmall ? 'p-1.5' : 'p-2'
        } rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          idea.userVote === -1
            ? isDarkMode
              ? 'bg-red-600 text-white'
              : 'bg-red-500 text-white'
            : isDarkMode
            ? 'bg-slate-700 hover:bg-red-600/50 text-slate-300'
            : 'bg-gray-100 hover:bg-red-100 text-gray-600'
        }`}
        title="Downvote"
      >
        <svg
          className={isSmall ? 'w-4 h-4' : 'w-5 h-5'}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 17l-7-7h14l-7 7z" />
        </svg>
      </button>
    </div>
  );
}
