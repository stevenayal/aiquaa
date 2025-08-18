'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Base64ConverterPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);

  const encodeText = (text: string) => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      return 'Error: No se pudo codificar el texto';
    }
  };

  const decodeText = (text: string) => {
    try {
      return decodeURIComponent(escape(atob(text)));
    } catch (error) {
      return 'Error: No se pudo decodificar el texto';
    }
  };

  const handleConvert = () => {
    if (inputText.trim() === '') {
      setOutputText('');
      return;
    }

    if (mode === 'encode') {
      setOutputText(encodeText(inputText));
    } else {
      setOutputText(decodeText(inputText));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (mode === 'encode') {
          // Para archivos, usamos la representación base64 directa
          setOutputText(result.split(',')[1] || result);
        } else {
          setInputText(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    const button = document.getElementById('copy-btn');
    if (button) {
      button.textContent = '¡Copiado!';
      setTimeout(() => {
        button.textContent = '📋 Copiar';
      }, 2000);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setFileName('');
    setFileSize(0);
  };

  const downloadResult = () => {
    if (mode === 'decode' && outputText) {
      try {
        // Intentar decodificar y crear un blob
        const binaryString = atob(outputText);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decoded_${fileName || 'file'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        // Si no es un archivo, descargar como texto
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decoded_${fileName || 'text'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  const isInputValid = () => {
    if (inputText.trim() === '') return false;
    
    if (mode === 'decode') {
      // Verificar que el input sea base64 válido
      try {
        atob(inputText);
        return true;
      } catch {
        return false;
      }
    }
    
    return true;
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
            🔄 Convertidor Base64
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Codifica y decodifica texto y archivos en Base64. Herramienta esencial para testers y desarrolladores.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-brand-text mb-4">Entrada</h2>
              
              {/* Mode Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-brand-text mb-2">
                  Modo de operación
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="encode"
                      checked={mode === 'encode'}
                      onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}
                      className="mr-2"
                    />
                    <span className="text-sm">Codificar (Texto → Base64)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="decode"
                      checked={mode === 'decode'}
                      onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}
                      className="mr-2"
                    />
                    <span className="text-sm">Decodificar (Base64 → Texto)</span>
                  </label>
                </div>
              </div>

              {/* Input Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-brand-text mb-2">
                  Tipo de entrada
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="text"
                      checked={inputType === 'text'}
                      onChange={(e) => setInputType(e.target.value as 'text' | 'file')}
                      className="mr-2"
                    />
                    <span className="text-sm">Texto</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={inputType === 'file'}
                      onChange={(e) => setInputType(e.target.value as 'text' | 'file')}
                      className="mr-2"
                    />
                    <span className="text-sm">Archivo</span>
                  </label>
                </div>
              </div>

              {/* File Upload */}
              {inputType === 'file' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-brand-text mb-2">
                    Seleccionar archivo
                  </label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                  />
                  {fileName && (
                    <div className="mt-2 text-sm text-brand-muted">
                      Archivo: {fileName} ({(fileSize / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>
              )}

              {/* Text Input */}
              {inputType === 'text' && (
                <div className="mb-6">
                  <label htmlFor="input-text" className="block text-sm font-medium text-brand-text mb-2">
                    {mode === 'encode' ? 'Texto a codificar' : 'Base64 a decodificar'}
                  </label>
                  <textarea
                    id="input-text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={mode === 'encode' ? 'Ingresa el texto que quieres codificar...' : 'Ingresa el Base64 que quieres decodificar...'}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent font-mono text-sm resize-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleConvert}
                  disabled={!isInputValid()}
                  className="flex-1 bg-brand-accent hover:bg-brand-primary disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {mode === 'encode' ? '🔒 Codificar' : '🔓 Decodificar'}
                </button>
                <button
                  onClick={clearAll}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div>
              <label htmlFor="output-text" className="block text-sm font-medium text-brand-text mb-2">
                Resultado
              </label>
              <textarea
                id="output-text"
                value={outputText}
                readOnly
                placeholder="El resultado aparecerá aquí..."
                className="w-full h-80 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
              />
            </div>

            {/* Output Actions */}
            {outputText && (
              <div className="flex gap-3">
                <button
                  id="copy-btn"
                  onClick={copyToClipboard}
                  className="bg-brand-primary hover:bg-brand-accent text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  📋 Copiar
                </button>
                {mode === 'decode' && (
                  <button
                    onClick={downloadResult}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    💾 Descargar
                  </button>
                )}
                <div className="flex items-center px-4 py-3 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {mode === 'encode' ? 'Base64' : 'Decodificado'} • {outputText.length} caracteres
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">
            ¿Por qué usar nuestro Convertidor Base64?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Conversión Instantánea</h3>
              <p className="text-brand-muted">
                Codifica y decodifica texto en tiempo real
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Soporte para Archivos</h3>
              <p className="text-brand-muted">
                Trabaja con texto y archivos binarios
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Herramientas Avanzadas</h3>
              <p className="text-brand-muted">
                Copia, descarga y valida automáticamente
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">
            Casos de Uso Comunes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-text">Codificación (Encode)</h3>
              <ul className="space-y-2 text-brand-muted">
                <li>• Enviar datos binarios en JSON</li>
                <li>• Codificar imágenes para APIs</li>
                <li>• Almacenar archivos en base de datos</li>
                <li>• Transmitir datos por HTTP</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-text">Decodificación (Decode)</h3>
              <ul className="space-y-2 text-brand-muted">
                <li>• Recuperar archivos de APIs</li>
                <li>• Decodificar respuestas de servicios</li>
                <li>• Extraer datos de logs</li>
                <li>• Procesar archivos codificados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
