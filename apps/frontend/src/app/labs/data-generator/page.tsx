'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert } from '@/components/common';

interface DataField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'date' | 'boolean' | 'phone' | 'address';
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: string[];
}

export default function DataGeneratorPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [fields, setFields] = useState<DataField[]>([
    { id: '1', name: 'nombre', type: 'text', minLength: 3, maxLength: 20 },
    { id: '2', name: 'email', type: 'email' },
    { id: '3', name: 'edad', type: 'number', minValue: 18, maxValue: 100 }
  ]);
  const [recordCount, setRecordCount] = useState(5);
  const [generatedData, setGeneratedData] = useState('');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const addField = () => {
    const newField: DataField = {
      id: Date.now().toString(),
      name: `campo_${fields.length + 1}`,
      type: 'text'
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<DataField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const generateRandomValue = (field: DataField): any => {
    switch (field.type) {
      case 'text':
        const words = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];
        const length = field.minLength || 5;
        const maxLength = field.maxLength || 50;
        const result = words.slice(0, Math.max(length, 1)).join(' ');
        return result.length > maxLength ? result.substring(0, maxLength) : result;
      
      case 'email':
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com'];
        const username = Math.random().toString(36).substring(2, 8);
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${username}@${domain}`;
      
      case 'number':
        const min = field.minValue || 0;
        const max = field.maxValue || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      
      case 'date':
        const start = new Date(2020, 0, 1);
        const end = new Date();
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().split('T')[0];
      
      case 'boolean':
        return Math.random() > 0.5;
      
      case 'phone':
        const prefixes = ['0981', '0982', '0983', '0984', '0985', '0986', '0987', '0988', '0989'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const phoneNumber = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
        return `${prefix}${phoneNumber}`;
      
      case 'address':
        const streets = ['Av. España', 'Av. Mcal. López', 'Av. Brasilia', 'Av. San Martín', 'Av. República', 'Av. Independencia', 'Av. Libertad', 'Av. Democracia'];
        const street = streets[Math.floor(Math.random() * streets.length)];
        const streetNumber = Math.floor(Math.random() * 1000) + 1;
        return `${street} ${streetNumber}`;
      
      default:
        return 'valor';
    }
  };

  const validateRecordCount = (count: number): boolean => {
    return count >= 1 && count <= 1000;
  };

  const generateData = () => {
    if (!validateRecordCount(recordCount)) {
      setAlertMessage('El número de registros debe estar entre 1 y 1000');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    if (fields.length === 0) {
      setAlertMessage('Debes agregar al menos un campo antes de generar datos');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    const data = [];
    
    for (let i = 0; i < recordCount; i++) {
      const record: any = {};
      fields.forEach(field => {
        record[field.name] = generateRandomValue(field);
      });
      data.push(record);
    }

    if (format === 'json') {
      setGeneratedData(JSON.stringify(data, null, 2));
    } else {
      // CSV format
      const headers = fields.map(f => f.name).join(',');
      const rows = data.map(record => 
        fields.map(field => {
          const value = record[field.name];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      );
      setGeneratedData([headers, ...rows].join('\n'));
    }

    // Mostrar mensaje de éxito
    setAlertMessage(`Se generaron ${recordCount} registros en formato ${format.toUpperCase()}`);
    setAlertType('success');
    setShowAlert(true);

    // Scroll automático a la salida
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedData);
    setAlertMessage('¡Datos copiados al portapapeles!');
    setAlertType('success');
    setShowAlert(true);
    
    // Ocultar alerta después de 2 segundos
    setTimeout(() => setShowAlert(false), 2000);
  };

  const downloadData = () => {
    const blob = new Blob([generatedData], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datos_generados.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setAlertMessage('¡Archivo descargado correctamente!');
    setAlertType('success');
    setShowAlert(true);
    
    // Ocultar alerta después de 2 segundos
    setTimeout(() => setShowAlert(false), 2000);
  };

  const handleRecordCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setRecordCount(value);
    
    // Validar en tiempo real
    if (!validateRecordCount(value)) {
      e.target.classList.add('border-red-500');
    } else {
      e.target.classList.remove('border-red-500');
    }
  };

  // Clases CSS dinámicas para modo oscuro
  const bgPrimary = isDarkMode ? 'bg-gray-900' : 'bg-brand-light';
  const bgSecondary = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-brand-text';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-brand-muted';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  const inputText = isDarkMode ? 'text-white' : 'text-gray-900';
  const placeholderText = isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const shadow = isDarkMode ? 'shadow-2xl' : 'shadow-lg';

  return (
    <div className={`min-h-screen ${bgPrimary} py-8 md:py-12 lg:py-16 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con botón de modo oscuro */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/labs" 
              className={`text-sm md:text-base ${textSecondary} hover:text-blue-400 transition-colors flex items-center`}
            >
              <span className="mr-2">←</span>
              <span className="hidden sm:inline">Volver a Labs</span>
              <span className="sm:hidden">Labs</span>
            </Link>
            
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${bgSecondary} ${textPrimary} hover:bg-opacity-80 transition-all duration-200 ${shadow}`}
              aria-label="Alternar modo oscuro"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 md:mb-6">
            <span className={textPrimary}>🎲 Generador de Datos</span>
          </h1>
          
          <p className={`text-base sm:text-lg md:text-xl ${textSecondary} max-w-3xl mx-auto px-4`}>
            Crea datos de prueba realistas para formularios, APIs y bases de datos. 
            <span className="hidden sm:inline"> Perfecto para testers y desarrolladores.</span>
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

        {/* Layout responsive mejorado */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {/* Configuration Section */}
          <div className="space-y-4 md:space-y-6 order-2 xl:order-1">
            <div className={`${bgSecondary} rounded-xl ${shadow} p-4 md:p-6 transition-all duration-300`}>
              <h2 className={`text-lg md:text-xl font-bold ${textPrimary} mb-4 md:mb-6`}>
                ⚙️ Configuración
              </h2>
              
              {/* Record Count */}
              <div className="mb-4 md:mb-6">
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Cantidad de registros
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={recordCount}
                  onChange={handleRecordCountChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${inputBg} ${inputBorder} ${inputText} ${placeholderText}`}
                  placeholder="5"
                />
                <p className={`text-xs mt-1 ${textSecondary}`}>
                  Mínimo: 1, Máximo: 1000
                </p>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
                  Formato de salida
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="json"
                      checked={format === 'json'}
                      onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={textPrimary}>JSON</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="csv"
                      checked={format === 'csv'}
                      onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={textPrimary}>CSV</span>
                  </label>
                </div>
              </div>

              {/* Fields Configuration */}
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <h3 className={`text-base md:text-lg font-semibold ${textPrimary}`}>Campos</h3>
                  <button
                    onClick={addField}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <span className="mr-1">➕</span>
                    <span className="hidden sm:inline">Agregar Campo</span>
                    <span className="sm:hidden">Agregar</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field) => (
                    <div key={field.id} className={`border rounded-lg p-3 md:p-4 transition-all duration-200 ${borderColor} ${bgSecondary}`}>
                      {/* Campo nombre y tipo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          placeholder="Nombre del campo"
                          className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${inputBg} ${inputBorder} ${inputText} ${placeholderText}`}
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as DataField['type'] })}
                          className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${inputBg} ${inputBorder} ${inputText}`}
                        >
                          <option value="text">Texto</option>
                          <option value="email">Email</option>
                          <option value="number">Número</option>
                          <option value="date">Fecha</option>
                          <option value="boolean">Booleano</option>
                          <option value="phone">Teléfono</option>
                          <option value="address">Dirección</option>
                        </select>
                      </div>

                      {/* Opciones específicas del tipo */}
                      {(field.type === 'text' || field.type === 'number') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          {field.type === 'text' ? (
                            <>
                              <input
                                type="number"
                                placeholder="Longitud mínima"
                                value={field.minLength || ''}
                                onChange={(e) => updateField(field.id, { minLength: parseInt(e.target.value) || undefined })}
                                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${inputBg} ${inputBorder} ${inputText} ${placeholderText}`}
                              />
                              <input
                                type="number"
                                placeholder="Longitud máxima"
                                value={field.maxLength || ''}
                                onChange={(e) => updateField(field.id, { maxLength: parseInt(e.target.value) || undefined })}
                                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${inputBg} ${inputBorder} ${inputText} ${placeholderText}`}
                              />
                            </>
                          ) : (
                            <>
                              <input
                                type="number"
                                placeholder="Valor mínimo"
                                value={field.minValue || ''}
                                onChange={(e) => updateField(field.id, { minValue: parseInt(e.target.value) || undefined })}
                                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${inputBg} ${inputBorder} ${inputText} ${placeholderText}`}
                              />
                              <input
                                type="number"
                                placeholder="Valor máximo"
                                value={field.maxValue || ''}
                                onChange={(e) => updateField(field.id, { maxValue: parseInt(e.target.value) || undefined })}
                                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${inputBg} ${inputBorder} ${inputText} ${placeholderText}`}
                              />
                            </>
                          )}
                        </div>
                      )}

                      {/* Botón eliminar */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeField(field.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200 flex items-center"
                        >
                          <span className="mr-1">🗑️</span>
                          <span className="hidden sm:inline">Eliminar</span>
                          <span className="sm:hidden">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón generar */}
              <button
                onClick={generateData}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 md:py-4 rounded-lg font-semibold transition-all duration-300 mt-6 transform hover:scale-105 active:scale-95"
              >
                🚀 Generar Datos
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4 md:space-y-6 order-1 xl:order-2">
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                📊 Datos Generados
              </label>
              <textarea
                ref={outputRef}
                value={generatedData}
                readOnly
                placeholder="Los datos generados aparecerán aquí..."
                className={`w-full h-64 md:h-80 lg:h-96 p-3 md:p-4 border rounded-lg font-mono text-sm resize-none transition-all duration-200 ${inputBg} ${inputBorder} ${inputText} ${placeholderText}`}
              />
            </div>

            {/* Acciones de salida */}
            {generatedData && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
                >
                  <span className="mr-2">📋</span>
                  <span className="hidden sm:inline">Copiar</span>
                  <span className="sm:hidden">Copiar</span>
                </button>
                <button
                  onClick={downloadData}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
                >
                  <span className="mr-2">💾</span>
                  <span className="hidden sm:inline">Descargar</span>
                  <span className="sm:hidden">Descargar</span>
                </button>
                <div className={`flex items-center justify-center px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {format.toUpperCase()} • {recordCount} registros
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de características */}
        <div className={`mt-12 md:mt-16 ${bgSecondary} rounded-xl ${shadow} p-6 md:p-8 transition-all duration-300`}>
          <h2 className={`text-xl md:text-2xl font-bold ${textPrimary} mb-6 text-center`}>
            ✨ Características del Generador de Datos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center p-4 rounded-lg hover:bg-opacity-50 transition-all duration-200">
              <div className="text-3xl md:text-4xl mb-3">🎯</div>
              <h3 className={`text-base md:text-lg font-semibold ${textPrimary} mb-2`}>Datos Realistas</h3>
              <p className={`text-sm md:text-base ${textSecondary}`}>
                Genera datos que se ven y comportan como información real
              </p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-opacity-50 transition-all duration-200">
              <div className="text-3xl md:text-4xl mb-3">⚙️</div>
              <h3 className={`text-base md:text-lg font-semibold ${textPrimary} mb-2`}>Configuración Flexible</h3>
              <p className={`text-sm md:text-base ${textSecondary}`}>
                Personaliza tipos de datos, rangos y restricciones
              </p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-opacity-50 transition-all duration-200">
              <div className="text-3xl md:text-4xl mb-3">📊</div>
              <h3 className={`text-base md:text-lg font-semibold ${textPrimary} mb-2`}>Múltiples Formatos</h3>
              <p className={`text-sm md:text-base ${textSecondary}`}>
                Exporta en JSON o CSV según tus necesidades
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
