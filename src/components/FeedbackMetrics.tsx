import React, { useState, useEffect } from 'react';
import { feedbackService, type FeedbackMetrics as FeedbackMetricsType } from '../services/feedbackService';

const FeedbackMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<FeedbackMetricsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = () => {
      const calculatedMetrics = feedbackService.calculateMetrics();
      setMetrics(calculatedMetrics);
      setIsLoading(false);
    };

    loadMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay datos disponibles
      </div>
    );
  }

  const exportData = () => {
    const data = feedbackService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aiquaa-feedback-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos de feedback? Esta acción no se puede deshacer.')) {
      feedbackService.clearData();
      setMetrics(feedbackService.calculateMetrics());
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📊 Métricas de Feedback</h2>
          <p className="text-gray-600">Datos recopilados de las respuestas del formulario</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={exportData}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📥 Exportar JSON
          </button>
          <button
            onClick={clearData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🗑️ Limpiar Datos
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-indigo-600 mb-2">{metrics.totalSubmissions}</div>
          <div className="text-sm text-gray-600">Total de Respuestas</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {metrics.topTemasQA.length > 0 ? metrics.topTemasQA[0].tema : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Tema Más Popular</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {metrics.topHerramientas.length > 0 ? metrics.topHerramientas[0].herramienta : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Herramienta Más Popular</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {metrics.commonSuggestions.length}
          </div>
          <div className="text-sm text-gray-600">Sugerencias Recibidas</div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Temas QA */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Temas de QA Más Populares</h3>
          {metrics.topTemasQA.length > 0 ? (
            <div className="space-y-3">
              {metrics.topTemasQA.map((item) => (
                <div key={item.tema} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.tema}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / metrics.totalSubmissions) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos disponibles</p>
          )}
        </div>

        {/* Herramientas */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🛠️ Herramientas Más Populares</h3>
          {metrics.topHerramientas.length > 0 ? (
            <div className="space-y-3">
              {metrics.topHerramientas.map((item) => (
                <div key={item.herramienta} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.herramienta}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / metrics.totalSubmissions) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos disponibles</p>
          )}
        </div>

        {/* Participación */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Tipos de Participación</h3>
          {metrics.topParticipacion.length > 0 ? (
            <div className="space-y-3">
              {metrics.topParticipacion.map((item) => (
                <div key={item.tipo} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.tipo}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / metrics.totalSubmissions) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos disponibles</p>
          )}
        </div>

        {/* Formatos */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Formatos Preferidos</h3>
          {metrics.topFormatos.length > 0 ? (
            <div className="space-y-3">
              {metrics.topFormatos.map((item) => (
                <div key={item.formato} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.formato}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / metrics.totalSubmissions) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      {metrics.submissionsByDate.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Respuestas por Fecha</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {metrics.submissionsByDate.slice(-6).map((item) => (
              <div key={item.date} className="text-center">
                <div className="text-lg font-bold text-indigo-600">{item.count}</div>
                <div className="text-xs text-gray-500">{item.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Word Frequency */}
      {metrics.commonSuggestions.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Palabras Más Frecuentes en Sugerencias</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(feedbackService.getWordFrequency())
              .sort(([,a], [,b]) => b - a)
              .slice(0, 20)
              .map(([word, count]) => (
                <span
                  key={word}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  title={`${count} veces`}
                >
                  {word} ({count})
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackMetrics; 