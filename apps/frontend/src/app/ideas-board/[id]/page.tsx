'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { SuruFloating } from '@/components/Suru';
import { ideasBoardService, type Idea, type IdeaComment } from '@/services/ideasBoardService';
import { IdeaVoteButtons } from '../components/IdeaVoteButtons';

const statusColors = {
  PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Pendiente' },
  APPROVED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'Aprobada' },
  IN_PROGRESS: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', label: 'En Progreso' },
  COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Completada' },
  REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Rechazada' },
};

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useSupabaseAuth();

  const ideaId = Number(params.id);

  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<IdeaComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment form
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(ideaId)) {
      router.push('/ideas-board');
      return;
    }

    fetchIdeaDetails();
    fetchComments();
  }, [ideaId]);

  const fetchIdeaDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const ideaData = await ideasBoardService.getIdea(ideaId);
      setIdea(ideaData);
    } catch (err) {
      console.error('Error fetching idea:', err);
      setError('Error al cargar la idea. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsData = await ideasBoardService.getComments(ideaId);
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleVoteChange = () => {
    fetchIdeaDetails();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setCommentError('Debes iniciar sesión para comentar');
      return;
    }

    if (commentContent.trim().length === 0) {
      setCommentError('El comentario no puede estar vacío');
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError(null);

      await ideasBoardService.addComment(ideaId, commentContent.trim());
      setCommentContent('');
      await fetchComments();
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setCommentError(err.message || 'Error al agregar el comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
        }`}
      >
        <SuruFloating />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div
        className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
        }`}
      >
        <SuruFloating />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`p-4 rounded-lg mb-4 ${
              isDarkMode
                ? 'bg-red-900/30 text-red-300'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {error || 'Idea no encontrada'}
          </div>
          <Link
            href="/ideas-board"
            className="inline-flex items-center gap-2 text-sm hover:underline text-yellow-500"
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
        </div>
      </div>
    );
  }

  const statusStyle = statusColors[idea.status];
  const createdDate = new Date(idea.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
      }`}
    >
      <SuruFloating />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/ideas-board"
          className={`inline-flex items-center gap-2 mb-6 text-sm hover:underline ${
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

        {/* Main content */}
        <div
          className={`rounded-lg shadow-md p-6 md:p-8 mb-6 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}
        >
          <div className="flex gap-6">
            {/* Voting section */}
            <div className="flex-shrink-0">
              <IdeaVoteButtons idea={idea} onVoteChange={handleVoteChange} size="large" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and status */}
              <div className="mb-4">
                <h1
                  className={`text-3xl md:text-4xl font-bold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}
                >
                  {idea.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {statusStyle.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{idea.category.icon}</span>
                    <span
                      className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}
                    >
                      {idea.category.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div
                className={`text-lg mb-6 whitespace-pre-wrap ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                {idea.description}
              </div>

              {/* Tags */}
              {idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {idea.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isDarkMode
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta information */}
              <div
                className={`flex flex-wrap items-center gap-4 text-sm border-t pt-4 ${
                  isDarkMode
                    ? 'border-slate-700 text-slate-400'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>por {idea.author.name || 'Usuario'}</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-2">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{createdDate}</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-2">
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
                  <span>{idea.viewCount} vistas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div
          className={`rounded-lg shadow-md p-6 md:p-8 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}
          >
            Comentarios ({comments.length})
          </h2>

          {/* Comment form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Escribe tu comentario..."
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border mb-3 ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none`}
              />

              {commentError && (
                <div
                  className={`mb-3 p-3 rounded text-sm ${
                    isDarkMode
                      ? 'bg-red-900/30 text-red-300'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {commentError}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingComment || commentContent.trim().length === 0}
                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Publicando...' : 'Publicar Comentario'}
              </button>
            </form>
          ) : (
            <div
              className={`mb-8 p-4 rounded-lg text-center ${
                isDarkMode
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Link href="/auth/login" className="text-yellow-500 hover:underline">
                Inicia sesión
              </Link>{' '}
              para comentar
            </div>
          )}

          {/* Comments list */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => {
                const commentDate = new Date(comment.createdAt).toLocaleDateString(
                  'es-ES',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                );

                return (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {comment.author.name || 'Usuario'}
                      </span>
                      <span
                        className={`text-sm ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}
                      >
                        •
                      </span>
                      <span
                        className={`text-sm ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}
                      >
                        {commentDate}
                      </span>
                    </div>
                    <p
                      className={`whitespace-pre-wrap ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}
                    >
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`text-center py-8 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}
            >
              No hay comentarios aún. Sé el primero en comentar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
