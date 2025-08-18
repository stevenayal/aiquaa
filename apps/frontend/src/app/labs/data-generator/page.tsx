'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [fields, setFields] = useState<DataField[]>([
    { id: '1', name: 'nombre', type: 'text', minLength: 3, maxLength: 20 },
    { id: '2', name: 'email', type: 'email' },
    { id: '3', name: 'edad', type: 'number', minValue: 18, maxValue: 100 }
  ]);
  const [recordCount, setRecordCount] = useState(5);
  const [generatedData, setGeneratedData] = useState('');
  const [format, setFormat] = useState<'json' | 'csv'>('json');

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
        const words = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
        const length = field.minLength || 5;
        return words.slice(0, Math.max(length, 1)).join(' ').substring(0, field.maxLength || 50);
      
      case 'email':
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
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
        const prefixes = ['0981', '0982', '0983', '0984', '0985'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
        return `${prefix}${number}`;
      
      case 'address':
        const streets = ['Av. España', 'Av. Mcal. López', 'Av. Brasilia', 'Av. San Martín'];
        const street = streets[Math.floor(Math.random() * streets.length)];
        const number = Math.floor(Math.random() * 1000) + 1;
        return `${street} ${number}`;
      
      default:
        return 'valor';
    }
  };

  const generateData = () => {
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
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedData);
    const button = document.getElementById('copy-btn');
    if (button) {
      button.textContent = '¡Copiado!';
      setTimeout(() => {
        button.textContent = '📋 Copiar';
      }, 2000);
    }
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
            🎲 Generador de Datos
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Crea datos de prueba realistas para formularios, APIs y bases de datos. Perfecto para testers y desarrolladores.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-brand-text mb-4">Configuración</h2>
              
              {/* Record Count */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-brand-text mb-2">
                  Cantidad de registros
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={recordCount}
                  onChange={(e) => setRecordCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                />
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-brand-text mb-2">
                  Formato de salida
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="json"
                      checked={format === 'json'}
                      onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                      className="mr-2"
                    />
                    JSON
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={format === 'csv'}
                      onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                      className="mr-2"
                    />
                    CSV
                  </label>
                </div>
              </div>

              {/* Fields Configuration */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-brand-text">Campos</h3>
                  <button
                    onClick={addField}
                    className="bg-brand-accent hover:bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    ➕ Agregar Campo
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          placeholder="Nombre del campo"
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as DataField['type'] })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent"
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

                      {/* Type-specific options */}
                      {(field.type === 'text' || field.type === 'number') && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {field.type === 'text' ? (
                            <>
                              <input
                                type="number"
                                placeholder="Longitud mínima"
                                value={field.minLength || ''}
                                onChange={(e) => updateField(field.id, { minLength: parseInt(e.target.value) || undefined })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                              />
                              <input
                                type="number"
                                placeholder="Longitud máxima"
                                value={field.maxLength || ''}
                                onChange={(e) => updateField(field.id, { maxLength: parseInt(e.target.value) || undefined })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                              />
                            </>
                          ) : (
                            <>
                              <input
                                type="number"
                                placeholder="Valor mínimo"
                                value={field.minValue || ''}
                                onChange={(e) => updateField(field.id, { minValue: parseInt(e.target.value) || undefined })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                              />
                              <input
                                type="number"
                                placeholder="Valor máximo"
                                value={field.maxValue || ''}
                                onChange={(e) => updateField(field.id, { maxValue: parseInt(e.target.value) || undefined })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                              />
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={() => removeField(field.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateData}
                className="w-full bg-brand-accent hover:bg-brand-primary text-white py-3 rounded-lg font-semibold transition-colors mt-6"
              >
                🚀 Generar Datos
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">
                Datos Generados
              </label>
              <textarea
                value={generatedData}
                readOnly
                placeholder="Los datos generados aparecerán aquí..."
                className="w-full h-96 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
              />
            </div>

            {/* Output Actions */}
            {generatedData && (
              <div className="flex gap-3">
                <button
                  id="copy-btn"
                  onClick={copyToClipboard}
                  className="bg-brand-primary hover:bg-brand-accent text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  📋 Copiar
                </button>
                <button
                  onClick={downloadData}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  💾 Descargar
                </button>
                <div className="flex items-center px-4 py-3 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {format.toUpperCase()} • {recordCount} registros
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">
            Características del Generador de Datos
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Datos Realistas</h3>
              <p className="text-brand-muted">
                Genera datos que se ven y comportan como información real
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Configuración Flexible</h3>
              <p className="text-brand-muted">
                Personaliza tipos de datos, rangos y restricciones
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Múltiples Formatos</h3>
              <p className="text-brand-muted">
                Exporta en JSON o CSV según tus necesidades
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
