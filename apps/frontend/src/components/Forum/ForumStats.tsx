'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import forumService from '../../services/forumService';

export default function ForumStats() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalThreads: 0,
    totalPosts: 0,
    totalUsers: 0,
    activeUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await forumService.getForumStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const card = isDarkMode ? 'bg-slate-800 rounded-lg shadow-lg p-6' : 'bg-white rounded-lg shadow-lg p-6';
  const skeletonBg = isDarkMode ? 'bg-slate-700' : 'bg-gray-200';
  const titleClass = isDarkMode ? 'text-white' : 'text-brand-text';
  const mutedClass = isDarkMode ? 'text-slate-400' : 'text-brand-muted';
  const borderClass = isDarkMode ? 'border-slate-700' : 'border-gray-200';

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className={card}>
          <div className="animate-pulse">
            <div className={`h-4 ${skeletonBg} rounded w-1/4 mb-4`}></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className={`h-8 ${skeletonBg} rounded w-16 mx-auto mb-2`}></div>
                  <div className={`h-4 ${skeletonBg} rounded w-20 mx-auto`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className={card}>
        <h2 className={`text-xl font-semibold mb-6 text-center ${titleClass}`}>
          {t('forum.stats.title')}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-accent mb-2">{stats.totalThreads.toLocaleString()}</div>
            <div className={`text-sm ${mutedClass}`}>{t('forum.stats.threads')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{stats.totalPosts.toLocaleString()}</div>
            <div className={`text-sm ${mutedClass}`}>{t('forum.stats.replies')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalUsers.toLocaleString()}</div>
            <div className={`text-sm ${mutedClass}`}>{t('forum.stats.members')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats.activeUsers.toLocaleString()}</div>
            <div className={`text-sm ${mutedClass}`}>{t('forum.stats.activeToday')}</div>
          </div>
        </div>

        <div className={`mt-6 pt-6 border-t ${borderClass}`}>
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm ${mutedClass}`}>
            <div>
              <span className="font-medium">{t('forum.stats.avgReplies')}</span>
              <br />
              <span className={titleClass}>
                {stats.totalThreads > 0 ? (stats.totalPosts / stats.totalThreads).toFixed(1) : '0'}
              </span>
            </div>
            <div>
              <span className="font-medium">{t('forum.stats.activity')}</span>
              <br />
              <span className={titleClass}>
                {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : '0'}%
              </span>
            </div>
            <div>
              <span className="font-medium">{t('forum.stats.lastUpdate')}</span>
              <br />
              <span className={titleClass}>
                {new Date().toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
