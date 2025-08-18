'use client';

import React, { useState, useEffect } from 'react';
import forumService from '../../services/forumService';

export default function ForumStats() {
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

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-brand-text mb-6 text-center">
          📊 Estadísticas del Foro
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total de Threads */}
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-accent mb-2">
              {stats.totalThreads.toLocaleString()}
            </div>
            <div className="text-sm text-brand-muted">
              Threads Creados
            </div>
          </div>

          {/* Total de Posts */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalPosts.toLocaleString()}
            </div>
            <div className="text-sm text-brand-muted">
              Respuestas
            </div>
          </div>

          {/* Total de Usuarios */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-brand-muted">
              Miembros
            </div>
          </div>

          {/* Usuarios Activos */}
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.activeUsers.toLocaleString()}
            </div>
            <div className="text-sm text-brand-muted">
              Activos Hoy
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-brand-muted">
            <div>
              <span className="font-medium">Promedio de respuestas por thread:</span>
              <br />
              <span className="text-brand-text">
                {stats.totalThreads > 0 
                  ? (stats.totalPosts / stats.totalThreads).toFixed(1) 
                  : '0'
                }
              </span>
            </div>
            
            <div>
              <span className="font-medium">Actividad de la comunidad:</span>
              <br />
              <span className="text-brand-text">
                {stats.totalUsers > 0 
                  ? Math.round((stats.activeUsers / stats.totalUsers) * 100) 
                  : '0'
                }%
              </span>
            </div>
            
            <div>
              <span className="font-medium">Última actualización:</span>
              <br />
              <span className="text-brand-text">
                {new Date().toLocaleDateString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
