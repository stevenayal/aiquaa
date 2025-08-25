'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/common';

export default function Base64ConverterPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

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

    let result: string;
    if (mode === 'encode') {
      result = encodeText(inputText);
    } else {
      result = decodeText(inputText);
    }
    
    setOutputText(result);
    
    // Mostrar mensaje de éxito
    setAlertMessage(`${mode === 'encode' ? 'Codificado' : 'Decodificado'} correctamente`);
    setAlertType('success');
    setShowAlert(true);
    
    // Scroll automático al resultado
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    
    // Ocultar alerta después de 2 segundos
    setTimeout(() => setShowAlert(false), 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validar tamaño del archivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setAlertMessage('El archivo es demasiado grande. Máximo 10MB permitido.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (mode === 'encode') {
        // Para archivos, usamos la representación base64 directa
        const base64 = result.split(',')[1] || result;
        setOutputText(base64);
        setInputText(base64);
      } else {
        setInputText(result);
      }
      
      // Mostrar mensaje de éxito
      setAlertMessage(`Archivo ${mode === 'encode' ? 'codificado' : 'cargado'} correctamente`);
      setAlertType('success');
      setShowAlert(true);
      
      // Scroll automático al resultado
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
      // Ocultar alerta después de 2 segundos
      setTimeout(() => setShowAlert(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    setAlertMessage('¡Copiado al portapapeles!');
    setAlertType('success');
    setShowAlert(true);
    
    // Ocultar alerta después de 2 segundos
    setTimeout(() => setShowAlert(false), 2000);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setFileName('');
    setFileSize(0);
    setShowAlert(false);
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
        
        setAlertMessage('¡Archivo descargado correctamente!');
        setAlertType('success');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
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
        
        setAlertMessage('¡Archivo descargado correctamente!');
        setAlertType('success');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
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

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    setInputText('');
    setOutputText('');
    setFileName('');
    setFileSize(0);
    setShowAlert(false);
  };

  const handleInputTypeChange = (newType: 'text' | 'file') => {
    setInputType(newType);
    setInputText('');
    setOutputText('');
    setFileName('');
    setFileSize(0);
    setShowAlert(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Limpiar salida al cambiar el input
    if (outputText) {
      setOutputText('');
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
            🔄 Convertidor Base64
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Codifica y decodifica texto y archivos en Base64. Herramienta esencial para testers y desarrolladores.
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
                      onChange={(e) => handleModeChange(e.target.value as 'encode' | 'decode')}
                      className="mr-2"
                    />
                    <span className="text-sm">Codificar (Texto → Base64)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="decode"
                      checked={mode === 'decode'}
                      onChange={(e) => handleModeChange(e.target.value as 'encode' | 'decode')}
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
                      onChange={(e) => handleInputTypeChange(e.target.value as 'text' | 'file')}
                      className="mr-2"
                    />
                    <span className="text-sm">Texto</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={inputType === 'file'}
                      onChange={(e) => handleInputTypeChange(e.target.value as 'text' | 'file')}
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
                  
                  {/* Drag & Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver 
                        ? 'border-brand-accent bg-brand-accent/10' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-brand-text mb-2">
                      Arrastra y suelta un archivo aquí
                    </p>
                    <p className="text-sm text-brand-muted mb-4">
                      o haz clic para seleccionar
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-brand-accent hover:bg-brand-primary text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Seleccionar Archivo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {fileName && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-brand-text">
                        <div className="font-medium">Archivo: {fileName}</div>
                        <div className="text-brand-muted">Tamaño: {(fileSize / 1024).toFixed(2)} KB</div>
                      </div>
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
                    onChange={handleInputChange}
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
                ref={outputRef}
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
