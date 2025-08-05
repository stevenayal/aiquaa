import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { load } from 'js-yaml';
import Breadcrumb from './Breadcrumb';

const YamlValidator: React.FC = () => {
  const [yamlInput, setYamlInput] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    line?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const exampleYaml = `# Ejemplo de YAML válido
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: my-app
spec:
  containers:
  - name: my-container
    image: nginx:latest
    ports:
    - containerPort: 80`;

  const validateYaml = () => {
    if (!yamlInput.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Por favor, ingresa código YAML para validar'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Parse YAML to validate
      load(yamlInput);
      setValidationResult({
        isValid: true,
        message: '✅ YAML válido - La estructura es correcta'
      });
    } catch (error: any) {
      // Extract line number from error message if available
      const lineMatch = error.message.match(/line (\d+)/);
      const line = lineMatch ? parseInt(lineMatch[1]) : undefined;
      
      setValidationResult({
        isValid: false,
        message: `❌ Error: ${error.message}`,
        line
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setYamlInput('');
    setValidationResult(null);
  };

  const loadExample = () => {
    setYamlInput(exampleYaml);
    setValidationResult(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(yamlInput);
  };

  return (
    <>
      <Helmet>
        <title>Validador de YAML - Labs | AIQUAA</title>
        <meta name="description" content="Valida la sintaxis y estructura de archivos YAML. Herramienta gratuita para desarrolladores y testers." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔍 Validador de YAML
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Valida la sintaxis y estructura de tus archivos YAML. 
              Detecta errores de formato, indentación y estructura.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Código YAML
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={loadExample}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Cargar ejemplo
                    </button>
                    <button
                      onClick={copyToClipboard}
                      disabled={!yamlInput.trim()}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={yamlInput}
                  onChange={(e) => setYamlInput(e.target.value)}
                  placeholder="Pega tu código YAML aquí..."
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  spellCheck="false"
                />
                
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={validateYaml}
                    disabled={isLoading || !yamlInput.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
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
                      'Validar YAML'
                    )}
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Limpiar
                  </button>
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
                        {validationResult.line && (
                          <p className="text-sm text-red-600 mt-1">
                            Error en línea: {validationResult.line}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">🔍</div>
                    <p>Ingresa código YAML y haz clic en "Validar YAML"</p>
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  💡 Consejos para YAML válido
                </h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>• Usa espacios para indentación (no tabs)</li>
                  <li>• Mantén consistencia en la indentación</li>
                  <li>• Los dos puntos deben tener un espacio después</li>
                  <li>• Las listas usan guiones (-) para elementos</li>
                  <li>• Los strings con caracteres especiales van entre comillas</li>
                </ul>
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
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-900 mb-2">Validación Instantánea</h3>
                <p className="text-gray-600 text-sm">
                  Detecta errores de sintaxis y estructura en tiempo real
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Línea Específica</h3>
                <p className="text-gray-600 text-sm">
                  Identifica exactamente en qué línea está el error
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-semibold text-gray-900 mb-2">Privacidad</h3>
                <p className="text-gray-600 text-sm">
                  Tu código se procesa localmente, no se envía a servidores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default YamlValidator; 