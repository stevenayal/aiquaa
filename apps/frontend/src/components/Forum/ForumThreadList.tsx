'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Thread } from '../../services/forumService';
import forumService from '../../services/forumService';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../services/authService';

interface ForumThreadListProps {
  threads: Thread[];
  onThreadDeleted: () => void;
  currentUser: User | null;
}

export default function ForumThreadList({ threads, onThreadDeleted, currentUser }: ForumThreadListProps) {
  const { isAuthenticated } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [deletingThread, setDeletingThread] = useState<string | null>(null);

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este thread? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingThread(threadId);
      const response = await forumService.deleteThread(threadId);
      
      if (response.success) {
        onThreadDeleted();
      } else {
        alert('Error eliminando thread: ' + response.error);
      }
    } catch (error) {
      console.error('Error eliminando thread:', error);
      alert('Error inesperado eliminando thread');
    } finally {
      setDeletingThread(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
      } else {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const light: Record<string, string> = {
      'General': 'bg-blue-100 text-blue-800',
      'Tecnología': 'bg-green-100 text-green-800',
      'QA': 'bg-purple-100 text-purple-800',
      'Testing': 'bg-orange-100 text-orange-800',
      'Herramientas': 'bg-indigo-100 text-indigo-800',
      'Carrera': 'bg-pink-100 text-pink-800',
      'Eventos': 'bg-red-100 text-red-800',
    };
    const dark: Record<string, string> = {
      'General': 'bg-blue-900/40 text-blue-300',
      'Tecnología': 'bg-green-900/40 text-green-300',
      'QA': 'bg-purple-900/40 text-purple-300',
      'Testing': 'bg-orange-900/40 text-orange-300',
      'Herramientas': 'bg-indigo-900/40 text-indigo-300',
      'Carrera': 'bg-pink-900/40 text-pink-300',
      'Eventos': 'bg-red-900/40 text-red-300',
    };
    const map = isDarkMode ? dark : light;
    return map[category] || (isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-800');
  };

  if (threads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <div key={thread.id} className={`rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2 min-w-[60px]">
              {thread.is_pinned && <span className="text-yellow-500 text-lg" title="Thread fijado">📌</span>}
              {thread.is_locked && <span className="text-red-500 text-lg" title="Thread bloqueado">🔒</span>}
              <div className="text-center">
                <div className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-brand-text'}`}>{thread.view_count}</div>
                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-brand-muted'}`}>{t('forum.thread.views')}</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-brand-text'}`}>{thread.reply_count}</div>
                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-brand-muted'}`}>{t('forum.thread.replies')}</div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(thread.category)}`}>
                  {thread.category}
                </span>
                {thread.tags.map((tag, index) => (
                  <span key={index} className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                    #{tag}
                  </span>
                ))}
              </div>

              <Link href={`/forum/thread/${thread.id}`} className="block group">
                <h3 className={`text-lg font-semibold group-hover:text-brand-accent transition-colors mb-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-brand-text'}`}>
                  {thread.title}
                </h3>
                <p className={`text-sm line-clamp-3 mb-3 ${isDarkMode ? 'text-slate-400' : 'text-brand-muted'}`}>
                  {thread.content}
                </p>
              </Link>

              <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                    {t('forum.thread.by')} <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-brand-text'}`}>{thread.author.display_name}</span>
                  </span>
                  <span className={isDarkMode ? 'text-slate-500' : 'text-brand-muted'}>{formatDate(thread.createdAt)}</span>
                  {thread.updatedAt !== thread.createdAt && (
                    <span className={isDarkMode ? 'text-slate-500' : 'text-brand-muted'}>({t('forum.thread.edited')} {formatDate(thread.updatedAt)})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isAuthenticated && (
                    <>
                      <Link href={`/forum/thread/${thread.id}`} className="text-brand-accent hover:text-brand-primary text-sm font-medium">
                        {t('forum.thread.view')}
                      </Link>
                      {currentUser && currentUser.id === thread.authorId && (
                        <>
                          <Link href={`/forum/thread/${thread.id}/edit`} className="text-blue-400 hover:text-blue-300 text-sm">{t('forum.thread.edit')}</Link>
                          <button
                            onClick={() => handleDeleteThread(thread.id)}
                            disabled={deletingThread === thread.id}
                            className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                          >
                            {deletingThread === thread.id ? t('forum.thread.deleting') : t('forum.thread.delete')}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
