'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Thread } from '../../services/forumService';
import forumService from '../../services/forumService';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { User } from '../../services/authService';

interface ForumThreadListProps {
  threads: Thread[];
  onThreadDeleted: () => void;
  currentUser: User | null;
}

export default function ForumThreadList({ threads, onThreadDeleted, currentUser }: ForumThreadListProps) {
  const { isAuthenticated } = useSupabaseAuth();
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
    const colors: Record<string, string> = {
      'General': 'bg-blue-100 text-blue-800',
      'Tecnología': 'bg-green-100 text-green-800',
      'QA': 'bg-purple-100 text-purple-800',
      'Testing': 'bg-orange-100 text-orange-800',
      'Herramientas': 'bg-indigo-100 text-indigo-800',
      'Carrera': 'bg-pink-100 text-pink-800',
      'Eventos': 'bg-red-100 text-red-800',
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (threads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <div key={thread.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start gap-4">
            {/* Indicadores del thread */}
            <div className="flex flex-col items-center gap-2 min-w-[60px]">
              {thread.isPinned && (
                <span className="text-yellow-500 text-lg" title="Thread fijado">📌</span>
              )}
              {thread.isLocked && (
                <span className="text-red-500 text-lg" title="Thread bloqueado">🔒</span>
              )}
              
              {/* Estadísticas */}
              <div className="text-center">
                <div className="text-lg font-semibold text-brand-text">{thread.viewCount}</div>
                <div className="text-xs text-brand-muted">vistas</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-brand-text">{thread.replyCount}</div>
                <div className="text-xs text-brand-muted">respuestas</div>
              </div>
            </div>

            {/* Contenido del thread */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(thread.category)}`}>
                  {thread.category}
                </span>
                
                {thread.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              <Link 
                href={`/forum/thread/${thread.id}`}
                className="block group"
              >
                <h3 className="text-lg font-semibold text-brand-text group-hover:text-brand-accent transition-colors mb-2 line-clamp-2">
                  {thread.title}
                </h3>
                
                <p className="text-brand-muted text-sm line-clamp-3 mb-3">
                  {thread.content}
                </p>
              </Link>

              {/* Meta información */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-brand-muted">
                    Por <span className="font-medium text-brand-text">{thread.author.username}</span>
                  </span>
                  <span className="text-brand-muted">
                    {formatDate(thread.createdAt)}
                  </span>
                  {thread.updatedAt !== thread.createdAt && (
                    <span className="text-brand-muted">
                      (editado {formatDate(thread.updatedAt)})
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  {isAuthenticated && (
                    <>
                      <Link
                        href={`/forum/thread/${thread.id}`}
                        className="text-brand-accent hover:text-brand-primary text-sm font-medium"
                      >
                        Ver thread →
                      </Link>
                      
                      {/* Solo el autor puede editar/eliminar */}
                      {currentUser && currentUser.id === thread.authorId && (
                        <>
                          <Link
                            href={`/forum/thread/${thread.id}/edit`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            ✏️ Editar
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteThread(thread.id)}
                            disabled={deletingThread === thread.id}
                            className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                          >
                            {deletingThread === thread.id ? '🗑️ Eliminando...' : '🗑️ Eliminar'}
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
