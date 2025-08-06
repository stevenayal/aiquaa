import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  error?: string;
}

const ApiTestComponent: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.aiquaa.com');

  const testEndpoints = [
    { name: 'Health Check', path: '/', method: 'GET' },
    { name: 'GET Comments', path: '/api/comments', method: 'GET' },
    { name: 'POST Comment', path: '/api/comments', method: 'POST' },
    { name: 'GET Feedback', path: '/api/feedback', method: 'GET' },
    { name: 'POST Feedback', path: '/api/feedback', method: 'POST' },
    { name: 'CORS Test', path: '/api/comments', method: 'OPTIONS' }
  ];

  const runTest = async (endpoint: typeof testEndpoints[0]): Promise<TestResult> => {
    const url = `${apiBaseUrl}${endpoint.path}`;
    
    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Aiquaa-Frontend-Test/1.0'
        }
      };

      // Agregar body para POST requests
      if (endpoint.method === 'POST') {
        if (endpoint.path === '/api/comments') {
          options.body = JSON.stringify({
            name: 'Test User',
            message: 'Comentario de prueba desde el frontend 🚀',
            isAnonymous: false
          });
        } else if (endpoint.path === '/api/feedback') {
          options.body = JSON.stringify({
            nombre: 'Test User',
            temasQA: ['automatizacion', 'api'],
            herramientas: ['cypress', 'postman'],
            participacion: 'taller',
            formato: 'videos',
            sugerencias: 'Excelente iniciativa para la comunidad de QA en Paraguay!',
            sessionId: 'test-session-' + Date.now(),
            userAgent: 'Aiquaa-Frontend-Test/1.0'
          });
        }
      }

      // Configuración especial para CORS test
      if (endpoint.method === 'OPTIONS') {
        options.headers = {
          'Origin': 'https://aiquaa.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        };
      }

      const response = await fetch(url, options);
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      return {
        endpoint: endpoint.name,
        status: response.ok ? 'success' : 'error',
        message: `Status: ${response.status} ${response.statusText}`,
        data: data
      };
    } catch (error) {
      return {
        endpoint: endpoint.name,
        status: 'error',
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const endpoint of testEndpoints) {
      // Actualizar el estado para mostrar el progreso
      setResults(prev => [...prev, {
        endpoint: endpoint.name,
        status: 'pending',
        message: 'Ejecutando...'
      }]);

      const result = await runTest(endpoint);
      
      // Actualizar el resultado
      setResults(prev => prev.map(r => 
        r.endpoint === endpoint.name ? result : r
      ));

      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'error': return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'pending': return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      default: return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 sm:p-6 ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>
      <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-dark-primary' : 'bg-white'} shadow-lg`}>
        <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${isDarkMode ? 'text-dark-accent' : 'text-indigo-600'}`}>
          🧪 Pruebas de API - Backend Aiquaa
        </h2>
        
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text' : 'text-gray-700'}`}>
            URL Base de la API:
          </label>
          <input
            type="url"
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrl(e.target.value)}
            className={`w-full p-3 border rounded-lg text-sm ${
              isDarkMode 
                ? 'border-dark-secondary bg-dark-secondary text-dark-text focus:ring-dark-accent' 
                : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="https://api.aiquaa.com"
          />
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isDarkMode 
              ? 'bg-dark-accent hover:bg-dark-accent/80 disabled:bg-dark-secondary text-dark-text' 
              : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white'
          }`}
        >
          {isRunning ? '🔄 Ejecutando pruebas...' : '🚀 Ejecutar todas las pruebas'}
        </button>
      </div>

      {/* Resultados */}
      <div className={`rounded-xl shadow-lg ${isDarkMode ? 'bg-dark-primary' : 'bg-white'}`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>
            📊 Resultados de las pruebas
          </h3>
        </div>

        <div className="p-4">
          {results.length === 0 ? (
            <p className={`text-center py-8 ${isDarkMode ? 'text-dark-muted' : 'text-gray-500'}`}>
              Haz clic en "Ejecutar todas las pruebas" para comenzar
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    isDarkMode ? 'border-dark-secondary' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>
                      {getStatusIcon(result.status)} {result.endpoint}
                    </h4>
                    <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                    {result.message}
                  </p>

                  {result.error && (
                    <div className={`p-3 rounded bg-red-50 border border-red-200 ${isDarkMode ? 'bg-red-900/20 border-red-700' : ''}`}>
                      <p className="text-sm text-red-600">
                        <strong>Error:</strong> {result.error}
                      </p>
                    </div>
                  )}

                  {result.data && result.status === 'success' && (
                    <details className="mt-3">
                      <summary className={`text-sm font-medium cursor-pointer ${isDarkMode ? 'text-dark-accent' : 'text-indigo-600'}`}>
                        Ver respuesta completa
                      </summary>
                      <pre className={`mt-2 p-3 rounded text-xs overflow-auto ${
                        isDarkMode 
                          ? 'bg-dark-secondary text-dark-text' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      {results.length > 0 && (
        <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-dark-primary' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>
            📈 Resumen
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-dark-secondary' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.status === 'success').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                Exitosas
              </div>
            </div>
            
            <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-dark-secondary' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-red-600">
                {results.filter(r => r.status === 'error').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                Fallidas
              </div>
            </div>
            
            <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-dark-secondary' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((results.filter(r => r.status === 'success').length / results.length) * 100)}%
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
                Tasa de éxito
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent; 