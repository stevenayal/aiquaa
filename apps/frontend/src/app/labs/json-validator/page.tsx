'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function JsonValidatorPage() {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [isFormatted, setIsFormatted] = useState(false);

  const validateJson = () => {
    try {
      const parsed = JSON.parse(inputJson);
      setIsValid(true);
      setError('');
      setOutputJson(JSON.stringify(parsed, null, 2));
      setIsFormatted(true);
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Error de sintaxis JSON');
      setOutputJson('');
      setIsFormatted(false);
    }
  };

  const formatJson = () => {
    if (isValid) {
      try {
        const parsed = JSON.parse(inputJson);
        setOutputJson(JSON.stringify(parsed, null, 2));
        setIsFormatted(true);
      } catch (err) {
        setError('Error al formatear JSON');
      }
    }
  };

  const minifyJson = () => {
    if (isValid) {
      try {
        const parsed = JSON.parse(inputJson);
        setOutputJson(JSON.stringify(parsed));
        setIsFormatted(false);
      } catch (err) {
        setError('Error al minificar JSON');
      }
    }
  };

  const clearAll = () => {
    setInputJson('');
    setOutputJson('');
    setIsValid(null);
    setError('');
    setIsFormatted(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputJson);
    // Mostrar feedback temporal
    const button = document.getElementById('copy-btn');
    if (button) {
      button.textContent = '¡Copiado!';
      setTimeout(() => {
        button.textContent = 'Copiar';
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link href="/labs" className="text-brand-muted hover:text-brand-text transition-colors">
              ← Volver a Labs
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            🔍 Validador de JSON
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Valida, formatea y minifica tu código JSON. Herramienta esencial para testers y desarrolladores.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label htmlFor="json-input" className="block text-sm font-medium text-brand-text mb-2">
                JSON de Entrada
              </label>
              <textarea
                id="json-input"
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder='{"nombre": "ejemplo", "edad": 25, "activo": true}'
                className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent font-mono text-sm resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={validateJson}
                className="bg-brand-accent hover:bg-brand-primary text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                ✅ Validar JSON
              </button>
              <button
                onClick={formatJson}
                disabled={!isValid}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                📝 Formatear
              </button>
              <button
                onClick={minifyJson}
                disabled={!isValid}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🗜️ Minificar
              </button>
              <button
                onClick={clearAll}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🗑️ Limpiar
              </button>
            </div>

            {/* Validation Status */}
            {isValid !== null && (
              <div className={`p-4 rounded-lg ${
                isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {isValid ? (
                    <>
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-800 font-medium">JSON válido</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-800 font-medium">JSON inválido</span>
                    </>
                  )}
                </div>
                {error && (
                  <p className="text-red-700 text-sm mt-2 font-mono">{error}</p>
                )}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div>
              <label htmlFor="json-output" className="block text-sm font-medium text-brand-text mb-2">
                Resultado
              </label>
              <textarea
                id="json-output"
                value={outputJson}
                readOnly
                placeholder="El JSON validado y formateado aparecerá aquí..."
                className="w-full h-80 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
              />
            </div>

            {/* Output Actions */}
            {outputJson && (
              <div className="flex gap-3">
                <button
                  id="copy-btn"
                  onClick={copyToClipboard}
                  className="bg-brand-primary hover:bg-brand-accent text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  📋 Copiar
                </button>
                <div className="flex items-center px-4 py-3 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {isFormatted ? 'Formateado' : 'Minificado'} • {outputJson.length} caracteres
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">
            ¿Por qué usar nuestro Validador JSON?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Validación Instantánea</h3>
              <p className="text-brand-muted">
                Detecta errores de sintaxis en tiempo real mientras escribes
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Formateo Inteligente</h3>
              <p className="text-brand-muted">
                Convierte JSON compacto en código legible y bien estructurado
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Herramientas Avanzadas</h3>
              <p className="text-brand-muted">
                Minifica, valida y formatea con un solo clic
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
