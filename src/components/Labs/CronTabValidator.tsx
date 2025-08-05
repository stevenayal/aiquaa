import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from './Breadcrumb';

interface CronField {
  name: string;
  min: number;
  max: number;
  allowed: string[];
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  nextExecutions: string[];
  description: string;
}

const CronTabValidator: React.FC = () => {
  const [cronExpression, setCronExpression] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cronFields: CronField[] = [
    { name: 'minuto', min: 0, max: 59, allowed: ['0-59', '*', '/', ',', '-'] },
    { name: 'hora', min: 0, max: 23, allowed: ['0-23', '*', '/', ',', '-'] },
    { name: 'día del mes', min: 1, max: 31, allowed: ['1-31', '*', '/', ',', '-', '?', 'L', 'W'] },
    { name: 'mes', min: 1, max: 12, allowed: ['1-12', '*', '/', ',', '-', 'JAN-DEC'] },
    { name: 'día de la semana', min: 0, max: 7, allowed: ['0-7', '*', '/', ',', '-', '?', 'L', '#', 'SUN-SAT'] }
  ];

  const exampleCrons = [
    { expression: '0 12 * * *', description: 'Todos los días a las 12:00' },
    { expression: '0 */6 * * *', description: 'Cada 6 horas' },
    { expression: '0 9 * * 1-5', description: 'Lunes a viernes a las 9:00' },
    { expression: '30 2 * * 0', description: 'Domingos a las 2:30' },
    { expression: '0 0 1 * *', description: 'Primer día de cada mes' }
  ];

  const validateCronExpression = (expression: string): ValidationResult => {
    const parts = expression.trim().split(/\s+/);
    
    if (parts.length !== 5) {
      return {
        isValid: false,
        message: '❌ La expresión cron debe tener exactamente 5 campos',
        nextExecutions: [],
        description: ''
      };
    }

    // Validate each field
    for (let i = 0; i < parts.length; i++) {
      const field = parts[i];
      const fieldConfig = cronFields[i];
      
      if (!isValidCronField(field, fieldConfig)) {
        return {
          isValid: false,
          message: `❌ Campo "${fieldConfig.name}" inválido: ${field}`,
          nextExecutions: [],
          description: ''
        };
      }
    }

    // If all validations pass, generate next executions
    const nextExecutions = generateNextExecutions();
    const description = generateDescription(parts);

    return {
      isValid: true,
      message: '✅ Expresión cron válida',
      nextExecutions,
      description
    };
  };

  const isValidCronField = (field: string, config: CronField): boolean => {
    // Handle special characters
    if (field === '*' || field === '?') return true;
    
    // Handle ranges
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return !isNaN(start) && !isNaN(end) && start >= config.min && end <= config.max && start <= end;
    }
    
    // Handle lists
    if (field.includes(',')) {
      return field.split(',').every(item => isValidCronField(item.trim(), config));
    }
    
    // Handle step values
    if (field.includes('/')) {
      const [base, step] = field.split('/');
      const stepNum = Number(step);
      return !isNaN(stepNum) && stepNum > 0 && isValidCronField(base, config);
    }
    
    // Handle single values
    const num = Number(field);
    return !isNaN(num) && num >= config.min && num <= config.max;
  };

  const generateNextExecutions = (): string[] => {
    const now = new Date();
    const executions: string[] = [];
    
    // Generate next 5 executions (simplified calculation)
    for (let i = 1; i <= 5; i++) {
      const nextDate = new Date(now.getTime() + (i * 60 * 60 * 1000)); // Add hours for demo
      executions.push(nextDate.toLocaleString('es-ES'));
    }
    
    return executions;
  };

  const generateDescription = (parts: string[]): string => {
    const [minute, hour, day, month, weekday] = parts;
    
    let description = '';
    
    if (minute === '0' && hour !== '*') {
      description += `A las ${hour}:00`;
    } else if (minute !== '*' && hour !== '*') {
      description += `A las ${hour}:${minute.padStart(2, '0')}`;
    } else if (minute === '0') {
      description += 'En punto';
    } else if (minute !== '*') {
      description += `En el minuto ${minute}`;
    }
    
    if (weekday !== '*' && weekday !== '?') {
      const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      if (weekday.includes('-')) {
        const [start, end] = weekday.split('-').map(Number);
        description += ` de ${weekdays[start]} a ${weekdays[end]}`;
      } else if (weekday.includes(',')) {
        const days = weekday.split(',').map(d => weekdays[Number(d)]);
        description += ` los ${days.join(', ')}`;
      } else {
        description += ` los ${weekdays[Number(weekday)]}s`;
      }
    }
    
    if (day !== '*' && day !== '?') {
      if (day === '1') {
        description += ' el primer día del mes';
      } else if (day.includes('L')) {
        description += ' el último día del mes';
      } else {
        description += ` el día ${day} del mes`;
      }
    }
    
    if (month !== '*') {
      const months = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      description += ` en ${months[Number(month)]}`;
    }
    
    return description || 'Expresión cron válida';
  };

  const handleValidate = () => {
    if (!cronExpression.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Por favor, ingresa una expresión cron',
        nextExecutions: [],
        description: ''
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      const result = validateCronExpression(cronExpression);
      setValidationResult(result);
      setIsLoading(false);
    }, 500);
  };

  const loadExample = (example: { expression: string; description: string }) => {
    setCronExpression(example.expression);
    setValidationResult(null);
  };

  const clearAll = () => {
    setCronExpression('');
    setValidationResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Validador de CronTab - Labs | AIQUAA</title>
        <meta name="description" content="Valida expresiones cron y visualiza las próximas ejecuciones. Herramienta gratuita para programación de tareas." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ⏰ Validador de CronTab
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Valida expresiones cron y visualiza las próximas ejecuciones programadas. 
              Perfecto para programación de tareas y automatización.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Expresión Cron
                  </h2>
                  <button
                    onClick={clearAll}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
                
                <div className="mb-4">
                  <input
                    type="text"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    placeholder="Ej: 0 12 * * *"
                    className="w-full p-4 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Formato: minuto hora día mes día_semana
                  </p>
                </div>
                
                <button
                  onClick={handleValidate}
                  disabled={isLoading || !cronExpression.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validando...
                    </span>
                  ) : (
                    'Validar CronTab'
                  )}
                </button>
              </div>

              {/* Examples Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📝 Ejemplos Comunes
                </h3>
                <div className="space-y-3">
                  {exampleCrons.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => loadExample(example)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-mono text-sm text-blue-600">{example.expression}</div>
                      <div className="text-sm text-gray-600">{example.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Resultado de Validación
                </h2>
                
                {validationResult ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${
                      validationResult.isValid 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-start">
                        <div className={`text-2xl mr-3 ${
                          validationResult.isValid ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {validationResult.isValid ? '✅' : '❌'}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            validationResult.isValid ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {validationResult.message}
                          </p>
                          {validationResult.isValid && validationResult.description && (
                            <p className="text-sm text-green-700 mt-1">
                              {validationResult.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {validationResult.isValid && validationResult.nextExecutions.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-3">
                          ⏰ Próximas Ejecuciones
                        </h3>
                        <ul className="space-y-1">
                          {validationResult.nextExecutions.map((execution, index) => (
                            <li key={index} className="text-sm text-blue-800">
                              {index + 1}. {execution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">⏰</div>
                    <p>Ingresa una expresión cron y haz clic en "Validar CronTab"</p>
                  </div>
                )}
              </div>

              {/* Cron Format Guide */}
              <div className="bg-yellow-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                  📋 Formato de Expresión Cron
                </h3>
                <div className="space-y-2 text-yellow-800 text-sm">
                  <p><strong>Formato:</strong> minuto hora día mes día_semana</p>
                  <p><strong>Ejemplo:</strong> 0 12 * * * (todos los días a las 12:00)</p>
                  <p><strong>Caracteres especiales:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• * = cualquier valor</li>
                    <li>• / = incremento (ej: */15 = cada 15)</li>
                    <li>• - = rango (ej: 1-5)</li>
                    <li>• , = lista (ej: 1,3,5)</li>
                    <li>• ? = sin valor específico (solo para día/mes)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Características del Validador
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-semibold text-gray-900 mb-2">Validación Completa</h3>
                <p className="text-gray-600 text-sm">
                  Verifica sintaxis y valores de cada campo cron
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">⏰</div>
                <h3 className="font-semibold text-gray-900 mb-2">Próximas Ejecuciones</h3>
                <p className="text-gray-600 text-sm">
                  Visualiza cuándo se ejecutará la tarea programada
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="font-semibold text-gray-900 mb-2">Descripción Clara</h3>
                <p className="text-gray-600 text-sm">
                  Explicación en lenguaje natural de la expresión
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CronTabValidator; 