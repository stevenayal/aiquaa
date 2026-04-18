'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';
import { useToolUsage } from '@/hooks/useToolUsage';

export default function JsonValidatorPage() {
  const { isDarkMode } = useTheme();
  const { logUsage, logError } = useToolUsage('json-validator');
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [isFormatted, setIsFormatted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  
  const outputRef = useRef<HTMLTextAreaElement>(null);

  // Ejemplo inicial mejorado
  const initialExample = JSON.stringify({
    nombre: "ejemplo",
    edad: 25,
    activo: true,
    hobbies: ["programación", "testing", "música"],
    direccion: {
      calle: "Av. España",
      ciudad: "Asunción",
      pais: "Paraguay"
    }
  }, null, 2);

  useEffect(() => {
    // Cargar ejemplo inicial
    setInputJson(initialExample);
  }, [initialExample]);

  const validateJson = () => {
    try {
      if (!inputJson.trim()) {
        setError('Por favor, ingresa algún contenido para validar');
        setIsValid(false);
        setOutputJson('');
        setIsFormatted(false);
        return;
      }

      const parsed = JSON.parse(inputJson);
      setIsValid(true);
      setError('');
      setOutputJson(JSON.stringify(parsed, null, 2));
      setIsFormatted(true);
      void logUsage('validate');

      // Mostrar alerta de éxito
      setAlertMessage('JSON válido y formateado correctamente');
      setAlertType('success');
      setShowAlert(true);
      
      // Scroll automático al resultado
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
    } catch (err) {
      void logError(err, 'validate');
      setIsValid(false);
      const errorMessage = err instanceof Error ? err.message : 'Error de sintaxis JSON';
      setError(errorMessage);
      setOutputJson('');
      setIsFormatted(false);
      
      // Mostrar alerta de error
      setAlertMessage(`Error de validación: ${errorMessage}`);
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const formatJson = () => {
    if (isValid) {
      try {
        const parsed = JSON.parse(inputJson);
        setOutputJson(JSON.stringify(parsed, null, 2));
        setIsFormatted(true);
        
        setAlertMessage('JSON formateado correctamente');
        setAlertType('success');
        setShowAlert(true);
      } catch (err) {
        setError('Error al formatear JSON');
        setAlertMessage('Error al formatear JSON');
        setAlertType('error');
        setShowAlert(true);
      }
    }
  };

  const minifyJson = () => {
    if (isValid) {
      try {
        const parsed = JSON.parse(inputJson);
        setOutputJson(JSON.stringify(parsed));
        setIsFormatted(false);
        
        setAlertMessage('JSON minificado correctamente');
        setAlertType('success');
        setShowAlert(true);
      } catch (err) {
        setError('Error al minificar JSON');
        setAlertMessage('Error al minificar JSON');
        setAlertType('error');
        setShowAlert(true);
      }
    }
  };

  const clearAll = () => {
    setInputJson('');
    setOutputJson('');
    setIsValid(null);
    setError('');
    setIsFormatted(false);
    setShowAlert(false);
  };

  const resetToExample = () => {
    setInputJson(initialExample);
    setOutputJson('');
    setIsValid(null);
    setError('');
    setIsFormatted(false);
    setShowAlert(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputJson);
    setAlertMessage('¡Copiado al portapapeles!');
    setAlertType('success');
    setShowAlert(true);
    
    // Ocultar alerta después de 2 segundos
    setTimeout(() => setShowAlert(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputJson(e.target.value);
    // Limpiar estado de validación al cambiar el input
    if (isValid !== null) {
      setIsValid(null);
      setError('');
      setShowAlert(false);
    }
  };

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link href="/labs" className={`transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-brand-muted hover:text-brand-text'
            }`}>
              ← Volver a Labs
            </Link>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            🔍 Validador de JSON
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Valida, formatea y minifica tu código JSON. Herramienta esencial para testers y desarrolladores.
          </p>
        </div>

        {/* Alertas */}
        {showAlert && (
          <div className="mb-6">
            <Alert
              type={alertType}
              message={alertMessage}
              onClose={() => setShowAlert(false)}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label htmlFor="json-input" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                JSON de Entrada
              </label>
              <textarea
                id="json-input"
                value={inputJson}
                onChange={handleInputChange}
                placeholder='{"nombre": "ejemplo", "edad": 25, "activo": true}'
                className={`w-full h-80 p-4 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent font-mono text-sm resize-none transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
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
              <button
                onClick={resetToExample}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🔄 Ejemplo
              </button>
            </div>

            {/* Validation Status - Ahora más cerca del input */}
            {isValid !== null && (
              <div className={`p-4 rounded-lg border ${
                isValid
                  ? isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'
                  : isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {isValid ? (
                    <>
                      <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>JSON válido</span>
                    </>
                  ) : (
                    <>
                      <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>JSON inválido</span>
                    </>
                  )}
                </div>
                {error && (
                  <p className={`text-sm mt-2 font-mono ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
                )}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div>
              <label htmlFor="json-output" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Resultado
              </label>
              <textarea
                ref={outputRef}
                id="json-output"
                value={outputJson}
                readOnly
                placeholder="El JSON validado y formateado aparecerá aquí..."
                className={`w-full h-80 p-4 rounded-lg font-mono text-sm resize-none transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Output Actions */}
            {outputJson && (
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="bg-brand-primary hover:bg-brand-accent text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  📋 Copiar
                </button>
                <div className={`flex items-center px-4 py-3 rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    {isFormatted ? 'Formateado' : 'Minificado'} • {outputJson.length} caracteres
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            ¿Por qué usar nuestro Validador JSON?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Validación Instantánea</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Detecta errores de sintaxis en tiempo real mientras escribes
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Formateo Inteligente</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Convierte JSON compacto en código legible y bien estructurado
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Herramientas Avanzadas</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Minifica, valida y formatea con un solo clic
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
