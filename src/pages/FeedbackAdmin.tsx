import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackMetrics from '../components/FeedbackMetrics';

const FeedbackAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'metrics'>('form');

  return (
    <>
      <Helmet>
        <title>Feedback & Métricas - Aiquaa</title>
        <meta name="description" content="Formulario de feedback y métricas para la comunidad de QA en Paraguay" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🎯 Feedback & Métricas
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recopila feedback de la comunidad y analiza las métricas para tomar decisiones informadas sobre el contenido y dirección de Aiquaa.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'form'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📝 Formulario
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'metrics'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📊 Métricas
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {activeTab === 'form' ? (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Formulario de Feedback
                  </h2>
                  <p className="text-gray-600">
                    Comparte tu opinión sobre temas de QA, herramientas y formatos de contenido
                  </p>
                </div>
                <FeedbackForm />
              </div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Análisis de Métricas
                  </h2>
                  <p className="text-gray-600">
                    Visualiza las tendencias y patrones en las respuestas de la comunidad
                  </p>
                </div>
                <FeedbackMetrics />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    const data = localStorage.getItem('aiquaa_feedback');
                    if (data) {
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `aiquaa-feedback-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  📥 Exportar Datos
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres limpiar todos los datos?')) {
                      localStorage.removeItem('aiquaa_feedback');
                      localStorage.removeItem('aiquaa_session_id');
                      window.location.reload();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  🗑️ Limpiar Datos
                </button>
                <button
                  onClick={() => {
                    const data = localStorage.getItem('aiquaa_feedback');
                    if (data) {
                      console.log('Feedback Data:', JSON.parse(data));
                      alert('Datos mostrados en la consola del navegador');
                    } else {
                      alert('No hay datos para mostrar');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  🔍 Ver en Consola
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackAdmin; 