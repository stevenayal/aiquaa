import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from './Breadcrumb';

interface DecodeResult {
  success: boolean;
  decodedText: string;
  error?: string;
}

const Base64Converter = () => {
  const [base64Input, setBase64Input] = useState('');
  const [decodeResult, setDecodeResult] = useState<DecodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Función para validar si una cadena es Base64 válida
  const isValidBase64 = (str: string): boolean => {
    try {
      // Verificar que solo contenga caracteres Base64 válidos
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str)) {
        return false;
      }
      
      // Intentar decodificar para verificar que sea válido
      atob(str);
      return true;
    } catch {
      return false;
    }
  };

  // Función para decodificar Base64 a texto
  const decodeBase64 = (base64String: string): DecodeResult => {
    try {
      // Limpiar espacios en blanco y caracteres de nueva línea
      const cleanBase64 = base64String.trim().replace(/\s/g, '');
      
      if (!cleanBase64) {
        return {
          success: false,
          decodedText: '',
          error: 'El campo de entrada está vacío'
        };
      }

      if (!isValidBase64(cleanBase64)) {
        return {
          success: false,
          decodedText: '',
          error: 'La cadena no es un Base64 válido'
        };
      }

      const decodedText = atob(cleanBase64);
      
      return {
        success: true,
        decodedText
      };
    } catch (error) {
      return {
        success: false,
        decodedText: '',
        error: 'Error al decodificar: ' + (error instanceof Error ? error.message : 'Error desconocido')
      };
    }
  };

  const handleDecode = () => {
    if (!base64Input.trim()) {
      setDecodeResult({
        success: false,
        decodedText: '',
        error: 'Por favor, ingresa una cadena Base64'
      });
      return;
    }

    setIsDecoding(true);
    
    // Simular delay para mejor UX
    setTimeout(() => {
      const result = decodeBase64(base64Input);
      setDecodeResult(result);
      setIsDecoding(false);
    }, 300);
  };

  const handleClear = () => {
    setBase64Input('');
    setDecodeResult(null);
    setCopySuccess(false);
  };

  const handleCopyResult = async () => {
    if (!decodeResult?.success) return;

    try {
      await navigator.clipboard.writeText(decodeResult.decodedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleLoadExample = () => {
    const exampleBase64 = 'SG9sYSBtdW5kby4gRXN0ZSB0ZXh0byBlc3TDoSBlbmNvZGlmaWNhZG8gZW4gQmFzZTY0Lg==';
    setBase64Input(exampleBase64);
    setDecodeResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Decodificador Base64 - Labs | AIQUAA</title>
        <meta name="description" content="Decodifica cadenas Base64 a texto plano. Herramienta útil para QA y desarrollo." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Breadcrumb />
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🔓 Decodificador Base64
                </h1>
                <p className="text-gray-600">
                  Convierte cadenas codificadas en Base64 a texto plano
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cadena Base64
                </h3>
                
                <div>
                  <label htmlFor="base64-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Ingresa tu cadena Base64
                  </label>
                  <textarea
                    id="base64-input"
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder="Pega aquí tu cadena Base64..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none text-gray-900 bg-white"
                  />
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleDecode}
                    disabled={isDecoding || !base64Input.trim()}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isDecoding ? 'Decodificando...' : 'Decodificar'}
                  </button>
                </div>

                {base64Input && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Longitud:</strong> {base64Input.trim().length} caracteres
                    </p>
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">¿Qué es Base64?</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>
                    Base64 es un esquema de codificación que convierte datos binarios en una secuencia de caracteres ASCII.
                  </p>
                  <p>
                    <strong>Caracteres válidos:</strong> A-Z, a-z, 0-9, +, /, y = (para padding)
                  </p>
                  <p>
                    <strong>Uso común:</strong> Codificación de imágenes, datos JSON, tokens de autenticación, etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Texto Decodificado
                  </h3>
                  {decodeResult?.success && (
                    <button
                      onClick={handleCopyResult}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      {copySuccess ? '¡Copiado!' : '📋 Copiar'}
                    </button>
                  )}
                </div>

                {!decodeResult ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">🔓</div>
                    <p className="text-gray-600">
                      Ingresa una cadena Base64 y haz clic en "Decodificar"
                    </p>
                  </div>
                ) : decodeResult.success ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-green-600 text-lg mr-2">✅</span>
                        <span className="text-green-800 font-medium">Decodificación exitosa</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resultado:
                      </label>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {decodeResult.decodedText}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      <strong>Longitud del texto:</strong> {decodeResult.decodedText.length} caracteres
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-red-600 text-lg mr-2">❌</span>
                      <span className="text-red-800 font-medium">Error en la decodificación</span>
                    </div>
                    <p className="text-red-700 text-sm">
                      {decodeResult.error}
                    </p>
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">💡 Consejos:</h4>
                <div className="text-sm text-yellow-700 space-y-2">
                  <div>• Asegúrate de que la cadena solo contenga caracteres Base64 válidos</div>
                  <div>• Los espacios en blanco y saltos de línea se eliminan automáticamente</div>
                  <div>• Si el resultado parece corrupto, verifica que la cadena original sea correcta</div>
                  <div>• Esta herramienta es útil para debugging y análisis de datos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Base64Converter; 