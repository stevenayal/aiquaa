'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import yaml from 'js-yaml';
import { Alert } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';

export default function YamlValidatorPage() {
  const { isDarkMode } = useTheme();
  const [inputYaml, setInputYaml] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [mode, setMode] = useState<'validate' | 'format' | 'toJson'>('validate');

  const outputRef = useRef<HTMLTextAreaElement>(null);

  const validateYaml = () => {
    if (inputYaml.trim() === '') {
      setIsValid(null);
      setErrorMessage('');
      setOutputText('');
      return;
    }

    try {
      const parsed = yaml.load(inputYaml);
      setIsValid(true);
      setErrorMessage('');
      setOutputText('✅ YAML válido');

      setAlertMessage('YAML validado correctamente');
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } catch (error: any) {
      setIsValid(false);
      const errorMsg = error.message || 'Error desconocido';
      setErrorMessage(errorMsg);
      setOutputText(`❌ Error de sintaxis:\n\n${errorMsg}`);

      setAlertMessage('YAML inválido');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const formatYaml = () => {
    if (inputYaml.trim() === '') {
      setOutputText('');
      return;
    }

    try {
      const parsed = yaml.load(inputYaml);
      const formatted = yaml.dump(parsed, {
        indent: 2,
        lineWidth: 80,
        noRefs: true,
        sortKeys: false,
      });

      setIsValid(true);
      setErrorMessage('');
      setOutputText(formatted);

      setAlertMessage('YAML formateado correctamente');
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);

      // Scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error: any) {
      setIsValid(false);
      const errorMsg = error.message || 'Error desconocido';
      setErrorMessage(errorMsg);
      setOutputText(`❌ No se puede formatear. Error:\n\n${errorMsg}`);

      setAlertMessage('Error al formatear YAML');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const convertToJson = () => {
    if (inputYaml.trim() === '') {
      setOutputText('');
      return;
    }

    try {
      const parsed = yaml.load(inputYaml);
      const jsonString = JSON.stringify(parsed, null, 2);

      setIsValid(true);
      setErrorMessage('');
      setOutputText(jsonString);

      setAlertMessage('Convertido a JSON correctamente');
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);

      // Scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error: any) {
      setIsValid(false);
      const errorMsg = error.message || 'Error desconocido';
      setErrorMessage(errorMsg);
      setOutputText(`❌ No se puede convertir. Error:\n\n${errorMsg}`);

      setAlertMessage('Error al convertir a JSON');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleAction = () => {
    switch (mode) {
      case 'validate':
        validateYaml();
        break;
      case 'format':
        formatYaml();
        break;
      case 'toJson':
        convertToJson();
        break;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    setAlertMessage('¡Copiado al portapapeles!');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const downloadResult = () => {
    if (!outputText) return;

    const extension = mode === 'toJson' ? 'json' : 'yaml';
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setAlertMessage('¡Archivo descargado correctamente!');
    setAlertType('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const clearAll = () => {
    setInputYaml('');
    setOutputText('');
    setIsValid(null);
    setErrorMessage('');
    setShowAlert(false);
  };

  const loadExample = () => {
    const exampleYaml = `# Ejemplo de configuración YAML
nombre: AIQUAA
version: "1.0.0"
descripcion: Platform de Quality Assurance

servicios:
  - nombre: backend
    puerto: 3001
    tecnologia: NestJS
    caracteristicas:
      - autenticacion
      - api-rest
      - base-datos

  - nombre: frontend
    puerto: 3001
    tecnologia: Next.js
    caracteristicas:
      - server-side-rendering
      - optimizacion-seo
      - responsive-design

configuracion:
  base_datos:
    tipo: PostgreSQL
    host: localhost
    puerto: 5432

  cache:
    tipo: Redis
    ttl: 3600

tags:
  - qa
  - testing
  - automation
  - ci-cd`;

    setInputYaml(exampleYaml);
    setIsValid(null);
    setErrorMessage('');
    setOutputText('');
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
            📝 Validador de YAML
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Valida sintaxis YAML, formatea tu código y convierte entre YAML y JSON. Herramienta esencial para DevOps y configuración.
          </p>
        </div>

        {/* Alerts */}
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
            <div className={`rounded-lg shadow-lg p-6 transition-colors ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Entrada YAML</h2>

              {/* Mode Selection */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}>
                  Modo de operación
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="validate"
                      checked={mode === 'validate'}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-900'
                    }`}>✅ Validar</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="format"
                      checked={mode === 'format'}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-900'
                    }`}>✨ Formatear</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="toJson"
                      checked={mode === 'toJson'}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-900'
                    }`}>🔄 YAML → JSON</span>
                  </label>
                </div>
              </div>

              {/* Text Input */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="input-yaml" className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>
                    Código YAML
                  </label>
                  {inputYaml && (
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {inputYaml.split('\n').length} líneas • {inputYaml.length} caracteres
                    </span>
                  )}
                </div>
                <textarea
                  id="input-yaml"
                  value={inputYaml}
                  onChange={(e) => {
                    setInputYaml(e.target.value);
                    setOutputText('');
                    setIsValid(null);
                    setErrorMessage('');
                  }}
                  placeholder="Pega tu código YAML aquí..."
                  className={`w-full h-96 p-4 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent font-mono text-sm resize-none transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAction}
                  disabled={!inputYaml.trim()}
                  className={`flex-1 min-w-[120px] py-3 rounded-lg font-semibold transition-colors ${
                    inputYaml.trim()
                      ? 'bg-brand-accent hover:bg-brand-primary text-white'
                      : isDarkMode
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {mode === 'validate' && '✅ Validar'}
                  {mode === 'format' && '✨ Formatear'}
                  {mode === 'toJson' && '🔄 Convertir a JSON'}
                </button>
                <button
                  onClick={loadExample}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  📋 Ejemplo
                </button>
                <button
                  onClick={clearAll}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isDarkMode
                      ? 'bg-slate-600 hover:bg-slate-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  🗑️ Limpiar
                </button>
              </div>

              {/* Validation Status */}
              {isValid !== null && (
                <div className={`mt-4 p-4 rounded-lg ${
                  isValid
                    ? isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                    : isDarkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{isValid ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        isValid
                          ? isDarkMode ? 'text-green-300' : 'text-green-800'
                          : isDarkMode ? 'text-red-300' : 'text-red-800'
                      }`}>
                        {isValid ? 'YAML Válido' : 'Error de Sintaxis'}
                      </p>
                      {errorMessage && (
                        <p className={`text-sm mt-1 font-mono ${
                          isDarkMode ? 'text-red-200' : 'text-red-700'
                        }`}>
                          {errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className={`rounded-lg shadow-lg p-6 transition-colors ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}>
                  Resultado
                </h2>
                {outputText && !outputText.startsWith('❌') && (
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {outputText.split('\n').length} líneas • {outputText.length} caracteres
                  </span>
                )}
              </div>

              <textarea
                ref={outputRef}
                value={outputText}
                readOnly
                placeholder="El resultado aparecerá aquí..."
                className={`w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none transition-colors ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />

              {/* Output Actions */}
              {outputText && !outputText.startsWith('❌') && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={copyToClipboard}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-brand-primary hover:bg-brand-accent text-white'
                    }`}
                  >
                    📋 Copiar
                  </button>
                  <button
                    onClick={downloadResult}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isDarkMode
                        ? 'bg-green-700 hover:bg-green-800 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    💾 Descargar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            ¿Por qué usar nuestro Validador de YAML?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Validación Instantánea</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Detecta errores de sintaxis en tiempo real
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Formateo Automático</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Organiza y embellece tu código YAML
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Conversión YAML ↔ JSON</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Convierte entre formatos fácilmente
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            Casos de Uso Comunes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Configuración
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-slate-400' : 'text-brand-muted'}`}>
                <li>• Docker Compose (docker-compose.yml)</li>
                <li>• Kubernetes manifests</li>
                <li>• GitHub Actions workflows</li>
                <li>• Ansible playbooks</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Desarrollo
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-slate-400' : 'text-brand-muted'}`}>
                <li>• OpenAPI/Swagger specs</li>
                <li>• CI/CD pipelines</li>
                <li>• Configuration files</li>
                <li>• Data serialization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* YAML Tips */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            💡 Tips de YAML
          </h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <p className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                📌 Indentación
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-brand-muted'}`}>
                YAML usa espacios (NO tabs) para indentación. Se recomienda 2 espacios.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <p className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                📌 Strings
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-brand-muted'}`}>
                No requieren comillas, pero úsalas si contienen caracteres especiales o empiezan con números.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <p className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                📌 Comentarios
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-brand-muted'}`}>
                Usa # para comentarios. Todo después de # en la línea es ignorado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
