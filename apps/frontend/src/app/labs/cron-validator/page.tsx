'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CronField {
  name: string;
  min: number;
  max: number;
  examples: string[];
  description: string;
}

interface CronValidation {
  isValid: boolean;
  nextExecutions: Date[];
  error?: string;
  fieldErrors: string[];
}

export default function CronValidatorPage() {
  const [cronExpression, setCronExpression] = useState('');
  const [validation, setValidation] = useState<CronValidation | null>(null);
  const [executionCount, setExecutionCount] = useState(5);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar tiempo actual cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const cronFields: CronField[] = [
    {
      name: 'Minuto',
      min: 0,
      max: 59,
      examples: ['0', '*/15', '30', '45'],
      description: 'Minuto del día (0-59)'
    },
    {
      name: 'Hora',
      min: 0,
      max: 23,
      examples: ['0', '12', '*/6', '18'],
      description: 'Hora del día (0-23)'
    },
    {
      name: 'Día del mes',
      min: 1,
      max: 31,
      examples: ['1', '15', '*/7', 'L'],
      description: 'Día del mes (1-31)'
    },
    {
      name: 'Mes',
      min: 1,
      max: 12,
      examples: ['1', '6', '*/3', 'DEC'],
      description: 'Mes del año (1-12 o JAN-DEC)'
    },
    {
      name: 'Día de la semana',
      min: 0,
      max: 7,
      examples: ['0', '6', 'MON', 'SUN'],
      description: 'Día de la semana (0-7, donde 0 y 7 = Domingo)'
    }
  ];

  const validateCronField = (field: string, fieldInfo: CronField): string | null => {
    if (!field || field === '*') return null;

    // Verificar rangos específicos
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      if (range !== '*' && !isValidRange(range, fieldInfo.min, fieldInfo.max)) {
        return `Rango inválido en ${fieldInfo.name}`;
      }
      if (!step || isNaN(Number(step)) || Number(step) <= 0) {
        return `Paso inválido en ${fieldInfo.name}`;
      }
      return null;
    }

    // Verificar rangos
    if (field.includes('-')) {
      const [start, end] = field.split('-');
      if (!isValidNumber(start, fieldInfo.min, fieldInfo.max) || 
          !isValidNumber(end, fieldInfo.min, fieldInfo.max) ||
          Number(start) > Number(end)) {
        return `Rango inválido en ${fieldInfo.name}`;
      }
      return null;
    }

    // Verificar valores individuales
    if (!isValidNumber(field, fieldInfo.min, fieldInfo.max)) {
      return `Valor inválido en ${fieldInfo.name}: ${field}`;
    }

    return null;
  };

  const isValidNumber = (value: string, min: number, max: number): boolean => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  };

  const isValidRange = (range: string, min: number, max: number): boolean => {
    if (range === '*') return true;
    if (range.includes('-')) {
      const [start, end] = range.split('-');
      return isValidNumber(start, min, max) && isValidNumber(end, min, max);
    }
    return isValidNumber(range, min, max);
  };

  const validateCronExpression = (expression: string): CronValidation => {
    const fields = expression.trim().split(/\s+/);
    
    if (fields.length !== 5) {
      return {
        isValid: false,
        nextExecutions: [],
        error: 'La expresión cron debe tener exactamente 5 campos',
        fieldErrors: []
      };
    }

    const fieldErrors: string[] = [];
    
    // Validar cada campo
    fields.forEach((field, index) => {
      const error = validateCronField(field, cronFields[index]);
      if (error) {
        fieldErrors.push(error);
      }
    });

    if (fieldErrors.length > 0) {
      return {
        isValid: false,
        nextExecutions: [],
        error: 'Campos cron inválidos',
        fieldErrors
      };
    }

    // Si es válido, calcular próximas ejecuciones
    const nextExecutions = calculateNextExecutions(expression, executionCount);
    
    return {
      isValid: true,
      nextExecutions,
      fieldErrors: []
    };
  };

  const calculateNextExecutions = (expression: string, count: number): Date[] => {
    const executions: Date[] = [];
    const currentDate = new Date(currentTime);
    
    // Avanzar al siguiente minuto para evitar ejecuciones pasadas
    currentDate.setSeconds(0, 0);
    currentDate.setMinutes(currentDate.getMinutes() + 1);

    while (executions.length < count) {
      if (isCronMatch(expression, currentDate)) {
        executions.push(new Date(currentDate));
      }
      currentDate.setMinutes(currentDate.getMinutes() + 1);
      
      // Evitar bucle infinito
      if (executions.length === 0 && currentDate.getTime() - currentTime.getTime() > 24 * 60 * 60 * 1000) {
        break;
      }
    }

    return executions;
  };

  const isCronMatch = (expression: string, date: Date): boolean => {
    const fields = expression.trim().split(/\s+/);
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1; // getMonth() retorna 0-11
    const dayOfWeek = date.getDay(); // 0 = Domingo

    return (
      isFieldMatch(fields[0], minute, 0, 59) &&
      isFieldMatch(fields[1], hour, 0, 23) &&
      isFieldMatch(fields[2], dayOfMonth, 1, 31) &&
      isFieldMatch(fields[3], month, 1, 12) &&
      isFieldMatch(fields[4], dayOfWeek, 0, 7)
    );
  };

  const isFieldMatch = (field: string, value: number, min: number, max: number): boolean => {
    if (field === '*') return true;
    
    if (field.includes(',')) {
      return field.split(',').some(f => isFieldMatch(f, value, min, max));
    }
    
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      const stepNum = Number(step);
      if (range === '*') {
        return value % stepNum === 0;
      }
      // Implementar lógica más compleja para rangos con pasos
      return true;
    }
    
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return value >= start && value <= end;
    }
    
    return Number(field) === value;
  };

  const handleValidate = () => {
    if (cronExpression.trim() === '') {
      setValidation(null);
      return;
    }

    const result = validateCronExpression(cronExpression.trim());
    setValidation(result);
  };

  const clearAll = () => {
    setCronExpression('');
    setValidation(null);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getTimeUntil = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ahora';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `en ${days}d ${hours % 24}h`;
    if (hours > 0) return `en ${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `en ${minutes}m`;
    return 'en menos de 1m';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const event = new CustomEvent('showToast', { 
      detail: { message: '¡Copiado al portapapeles!', type: 'success' } 
    });
    window.dispatchEvent(event);
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
            ⏰ Validador de Cron
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Valida expresiones cron y calcula las próximas ejecuciones. Herramienta esencial para programar tareas y automatizaciones.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-brand-text mb-4">Expresión Cron</h2>
              
              <div className="mb-6">
                <label htmlFor="cron-input" className="block text-sm font-medium text-brand-text mb-2">
                  Ingresa tu expresión cron
                </label>
                <textarea
                  id="cron-input"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="0 12 * * 1"
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent font-mono text-sm resize-none"
                />
              </div>

              {/* Execution Count */}
              <div className="mb-6">
                <label htmlFor="execution-count" className="block text-sm font-medium text-brand-text mb-2">
                  Número de próximas ejecuciones
                </label>
                <input
                  id="execution-count"
                  type="number"
                  min="1"
                  max="20"
                  value={executionCount}
                  onChange={(e) => setExecutionCount(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleValidate}
                  disabled={!cronExpression.trim()}
                  className="flex-1 bg-brand-accent hover:bg-brand-primary disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  ✅ Validar Cron
                </button>
                <button
                  onClick={clearAll}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  🗑️ Limpiar
                </button>
              </div>

              {/* Current Time */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Tiempo actual:</div>
                  <div className="font-mono">{currentTime.toLocaleString('es-ES')}</div>
                </div>
              </div>
            </div>

            {/* Cron Fields Reference */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-brand-text mb-4">Referencia de Campos</h3>
              <div className="space-y-4">
                {cronFields.map((field, index) => (
                  <div key={index} className="border-l-4 border-brand-accent pl-4">
                    <div className="font-medium text-brand-text">{field.name}</div>
                    <div className="text-sm text-brand-muted mb-2">{field.description}</div>
                    <div className="text-xs text-gray-500">
                      Rango: {field.min}-{field.max} | Ejemplos: {field.examples.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {validation ? (
              <div className="space-y-6">
                {/* Validation Status */}
                <div className={`p-4 rounded-lg border ${
                  validation.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center">
                    {validation.isValid ? (
                      <>
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-800 font-medium">Expresión cron válida</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 font-medium">Expresión cron inválida</span>
                      </>
                    )}
                  </div>
                  {validation.error && (
                    <p className="text-red-700 text-sm mt-2">{validation.error}</p>
                  )}
                </div>

                {/* Field Errors */}
                {validation.fieldErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Errores por campo:</h4>
                    <ul className="space-y-1">
                      {validation.fieldErrors.map((error, index) => (
                        <li key={index} className="text-red-700 text-sm">• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Executions */}
                {validation.isValid && validation.nextExecutions.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-brand-text">
                        Próximas {validation.nextExecutions.length} ejecuciones
                      </h3>
                      <button
                        onClick={() => copyToClipboard(validation.nextExecutions.map(d => formatDate(d)).join('\n'))}
                        className="text-brand-accent hover:text-brand-primary text-sm font-medium transition-colors"
                      >
                        📋 Copiar todas
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {validation.nextExecutions.map((date, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-mono text-brand-accent">
                              #{index + 1}
                            </span>
                            <div>
                              <div className="font-medium text-brand-text">
                                {formatDate(date)}
                              </div>
                              <div className="text-sm text-brand-muted">
                                {getTimeUntil(date)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(formatDate(date))}
                            className="text-gray-500 hover:text-brand-accent transition-colors"
                          >
                            📋
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expression Analysis */}
                {validation.isValid && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-brand-text mb-4">Análisis de la Expresión</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expresión:</span>
                        <span className="font-mono text-sm">{cronExpression}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Campos:</span>
                        <span className="text-sm">{cronExpression.split(/\s+/).length}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="text-green-600 font-medium">Válida</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏰</div>
                <h3 className="text-xl font-semibold text-brand-text mb-2">
                  Ingresa una expresión cron
                </h3>
                <p className="text-brand-muted">
                  Pega tu expresión cron en el campo de la izquierda y haz clic en &quot;Validar Cron&quot; para verificar su validez y calcular las próximas ejecuciones.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">
            ¿Por qué usar nuestro Validador de Cron?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Validación Instantánea</h3>
              <p className="text-brand-muted">
                Verifica la sintaxis de tus expresiones cron en tiempo real
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Cálculo de Ejecuciones</h3>
              <p className="text-brand-muted">
                Calcula las próximas ejecuciones de tu tarea programada
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold text-brand-text mb-2">Referencia Completa</h3>
              <p className="text-brand-muted">
                Guía de referencia para todos los campos cron
              </p>
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">
            Ejemplos Comunes de Expresiones Cron
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-text">Tareas Diarias</h3>
              <div className="space-y-2 text-sm">
                <div className="font-mono bg-gray-100 p-2 rounded">0 0 * * *</div>
                <div className="text-gray-600">Todos los días a medianoche</div>
                
                <div className="font-mono bg-gray-100 p-2 rounded">0 12 * * *</div>
                <div className="text-gray-600">Todos los días al mediodía</div>
                
                <div className="font-mono bg-gray-100 p-2 rounded">0 9 * * 1-5</div>
                <div className="text-gray-600">Lunes a viernes a las 9:00 AM</div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-text">Tareas Semanales</h3>
              <div className="space-y-2 text-sm">
                <div className="font-mono bg-gray-100 p-2 rounded">0 0 * * 0</div>
                <div className="text-gray-600">Todos los domingos a medianoche</div>
                
                <div className="font-mono bg-gray-100 p-2 rounded">0 8 * * 1</div>
                <div className="text-gray-600">Todos los lunes a las 8:00 AM</div>
                
                <div className="font-mono bg-gray-100 p-2 rounded">0 18 * * 5</div>
                <div className="text-gray-600">Todos los viernes a las 6:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
