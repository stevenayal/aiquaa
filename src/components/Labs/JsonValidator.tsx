import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from './Breadcrumb';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface TestCase {
  casoPrueba: string;
  descripcion: string;
  pasos: string[];
  resultadoEsperado: string;
}

const JsonValidator = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [exampleJson, setExampleJson] = useState('');

  // JSON de ejemplo para mostrar la estructura esperada
  const sampleJson: TestCase = {
    casoPrueba: "CP001 - Login Exitoso",
    descripcion: "Verificar que un usuario puede iniciar sesión con credenciales válidas",
    pasos: [
      "Navegar a la página de login",
      "Ingresar email válido",
      "Ingresar contraseña válida",
      "Hacer clic en 'Iniciar Sesión'"
    ],
    resultadoEsperado: "El usuario debe ser redirigido al dashboard principal"
  };

  useEffect(() => {
    setExampleJson(JSON.stringify(sampleJson, null, 2));
  }, []);

  const validateJson = (jsonString: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Intentar parsear el JSON
      const parsed = JSON.parse(jsonString);
      
      // Verificar que sea un objeto
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        errors.push('El JSON debe ser un objeto, no un array o valor primitivo');
        return { isValid: false, errors, warnings };
      }

      // Verificar claves requeridas
      const requiredKeys = ['casoPrueba', 'descripcion', 'pasos', 'resultadoEsperado'];
      
      requiredKeys.forEach(key => {
        if (!(key in parsed)) {
          errors.push(`Falta la clave requerida: "${key}"`);
        }
      });

      // Validaciones específicas por tipo de dato
      if ('casoPrueba' in parsed) {
        if (typeof parsed.casoPrueba !== 'string') {
          errors.push('"casoPrueba" debe ser una cadena de texto');
        } else if (parsed.casoPrueba.trim() === '') {
          errors.push('"casoPrueba" no puede estar vacío');
        }
      }

      if ('descripcion' in parsed) {
        if (typeof parsed.descripcion !== 'string') {
          errors.push('"descripcion" debe ser una cadena de texto');
        } else if (parsed.descripcion.trim() === '') {
          errors.push('"descripcion" no puede estar vacío');
        }
      }

      if ('pasos' in parsed) {
        if (!Array.isArray(parsed.pasos)) {
          errors.push('"pasos" debe ser un array');
        } else if (parsed.pasos.length === 0) {
          errors.push('"pasos" no puede estar vacío');
        } else {
          parsed.pasos.forEach((paso: any, index: number) => {
            if (typeof paso !== 'string') {
              errors.push(`Paso ${index + 1} debe ser una cadena de texto`);
            } else if (paso.trim() === '') {
              errors.push(`Paso ${index + 1} no puede estar vacío`);
            }
          });
        }
      }

      if ('resultadoEsperado' in parsed) {
        if (typeof parsed.resultadoEsperado !== 'string') {
          errors.push('"resultadoEsperado" debe ser una cadena de texto');
        } else if (parsed.resultadoEsperado.trim() === '') {
          errors.push('"resultadoEsperado" no puede estar vacío');
        }
      }

      // Advertencias
      if (parsed.descripcion && parsed.descripcion.length < 20) {
        warnings.push('La descripción es muy corta. Considera agregar más detalles.');
      }

      if (parsed.pasos && parsed.pasos.length < 2) {
        warnings.push('Considera agregar más pasos para mayor claridad.');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        isValid: false,
        errors: ['Error de sintaxis JSON: ' + (error as Error).message],
        warnings: []
      };
    }
  };

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setValidationResult({
        isValid: false,
        errors: ['Por favor, ingresa un JSON para validar'],
        warnings: []
      });
      return;
    }

    setIsValidating(true);
    
    // Simular un pequeño delay para mejor UX
    setTimeout(() => {
      const result = validateJson(jsonInput);
      setValidationResult(result);
      setIsValidating(false);
    }, 300);
  };

  const handleLoadExample = () => {
    setJsonInput(exampleJson);
    setValidationResult(null);
  };

  const handleClear = () => {
    setJsonInput('');
    setValidationResult(null);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonInput);
      // Aquí podrías mostrar un toast de confirmación
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Validador de JSON - Labs | AIQUAA</title>
        <meta name="description" content="Valida la estructura de casos de prueba en formato JSON. Verifica que contenga todas las claves requeridas." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Breadcrumb />
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🔍 Validador de JSON
                </h1>
                <p className="text-gray-600">
                  Valida la estructura de casos de prueba en formato JSON
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleLoadExample}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cargar Ejemplo
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Input Section */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 mb-2">
                  JSON del Caso de Prueba
                </label>
                <textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Pega aquí tu JSON..."
                  className="w-full h-64 sm:h-80 lg:h-96 p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs sm:text-sm resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="flex-1 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                >
                  {isValidating ? 'Validando...' : 'Validar JSON'}
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  disabled={!jsonInput.trim()}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  title="Copiar al portapapeles"
                >
                  📋 Copiar
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Resultado de la Validación
                </h3>
                
                {validationResult && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Status */}
                    <div className={`p-3 sm:p-4 rounded-lg border ${
                      validationResult.isValid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start sm:items-center">
                        <span className="text-xl sm:text-2xl mr-2 sm:mr-3 mt-1 sm:mt-0">
                          {validationResult.isValid ? '✅' : '❌'}
                        </span>
                        <div>
                          <h4 className={`font-semibold text-sm sm:text-base ${
                            validationResult.isValid ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {validationResult.isValid ? 'JSON Válido' : 'JSON Inválido'}
                          </h4>
                          <p className={`text-xs sm:text-sm ${
                            validationResult.isValid ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {validationResult.isValid 
                              ? 'El JSON cumple con la estructura requerida para casos de prueba'
                              : 'Se encontraron errores en la estructura del JSON'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Errors */}
                    {validationResult.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-red-800 mb-2 sm:mb-3 text-sm sm:text-base">Errores encontrados:</h4>
                        <ul className="space-y-1 sm:space-y-2">
                          {validationResult.errors.map((error, index) => (
                            <li key={index} className="text-red-700 text-xs sm:text-sm flex items-start">
                              <span className="mr-2 mt-1">•</span>
                              <span className="flex-1">{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {validationResult.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2 sm:mb-3 text-sm sm:text-base">Advertencias:</h4>
                        <ul className="space-y-1 sm:space-y-2">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index} className="text-yellow-700 text-xs sm:text-sm flex items-start">
                              <span className="mr-2 mt-1">⚠️</span>
                              <span className="flex-1">{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {!validationResult && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
                    <div className="text-gray-400 text-2xl sm:text-4xl mb-3 sm:mb-4">🔍</div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Ingresa un JSON y haz clic en "Validar JSON" para comenzar
                    </p>
                  </div>
                )}
              </div>

              {/* Structure Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-blue-800 mb-2 sm:mb-3 text-sm sm:text-base">Estructura Requerida:</h4>
                <div className="text-xs sm:text-sm text-blue-700 space-y-1 sm:space-y-2">
                  <div><strong>casoPrueba:</strong> Identificador único del caso</div>
                  <div><strong>descripcion:</strong> Descripción detallada del caso</div>
                  <div><strong>pasos:</strong> Array con los pasos a seguir</div>
                  <div><strong>resultadoEsperado:</strong> Resultado esperado del caso</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JsonValidator; 