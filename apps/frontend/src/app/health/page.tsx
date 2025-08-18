'use client';

import { useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
  time: string;
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
        if (!apiUrl && process.env.NODE_ENV === 'production') {
          throw new Error('NEXT_PUBLIC_API_URL no está configurada');
        }
        const base = apiUrl || 'http://localhost:3001';
        const response = await fetch(`${base}/health`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Health Check</h1>
        
        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Verificando conexión con el backend...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">❌ Error</div>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Asegúrate de que el backend esté ejecutándose en {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
            </p>
          </div>
        )}
        
        {health && (
          <div className="text-center">
            <div className="text-green-500 text-lg mb-2">✅ Conectado</div>
            <div className="bg-gray-100 rounded p-4">
              <p><strong>Status:</strong> {health.status}</p>
              <p><strong>Time:</strong> {new Date(health.time).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
