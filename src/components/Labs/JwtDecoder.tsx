import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from './Breadcrumb';
import jwtExamples from './example-jwt-tokens.json';

interface DecodedJwt {
  header: any;
  payload: any;
  signature: string;
  isExpired: boolean;
  expirationDate?: Date;
}

interface DecodeResult {
  success: boolean;
  decoded?: DecodedJwt;
  error?: string;
}

const JwtDecoder = () => {
  const [jwtInput, setJwtInput] = useState('');
  const [decodeResult, setDecodeResult] = useState<DecodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Función para decodificar Base64 URL Safe
  const base64UrlDecode = (str: string): string => {
    // Reemplazar caracteres URL-safe
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Agregar padding si es necesario
    while (base64.length % 4) {
      base64 += '=';
    }
    
    try {
      return atob(base64);
    } catch (error) {
      throw new Error('No se puede decodificar la cadena Base64');
    }
  };

  // Función para parsear JSON de forma segura
  const safeJsonParse = (str: string): any => {
    try {
      return JSON.parse(str);
    } catch (error) {
      throw new Error('No se puede parsear como JSON válido');
    }
  };

  // Función para verificar si el token ha expirado
  const checkExpiration = (payload: any): { isExpired: boolean; expirationDate?: Date } => {
    if (!payload.exp) {
      return { isExpired: false };
    }

    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    
    return {
      isExpired: now > expirationDate,
      expirationDate
    };
  };

  // Función principal para decodificar JWT
  const decodeJwt = (jwt: string): DecodeResult => {
    try {
      // Verificar que el JWT tenga 3 partes
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        return {
          success: false,
          error: 'El JWT debe tener exactamente 3 partes separadas por puntos (header.payload.signature)'
        };
      }

      const [headerB64, payloadB64, signature] = parts;

      // Decodificar header
      const headerStr = base64UrlDecode(headerB64);
      const header = safeJsonParse(headerStr);

      // Decodificar payload
      const payloadStr = base64UrlDecode(payloadB64);
      const payload = safeJsonParse(payloadStr);

      // Verificar expiración
      const expirationInfo = checkExpiration(payload);

      return {
        success: true,
        decoded: {
          header,
          payload,
          signature,
          isExpired: expirationInfo.isExpired,
          expirationDate: expirationInfo.expirationDate
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al decodificar el JWT'
      };
    }
  };

  const handleDecode = () => {
    if (!jwtInput.trim()) {
      setDecodeResult({
        success: false,
        error: 'Por favor, ingresa un token JWT'
      });
      return;
    }

    setIsDecoding(true);
    
    // Simular un pequeño delay para mejor UX
    setTimeout(() => {
      const result = decodeJwt(jwtInput.trim());
      setDecodeResult(result);
      setIsDecoding(false);
    }, 300);
  };

  const handleClear = () => {
    setJwtInput('');
    setDecodeResult(null);
  };

  const handleCopyPayload = async () => {
    if (decodeResult?.success && decodeResult.decoded) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(decodeResult.decoded.payload, null, 2));
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Error al copiar al portapapeles:', error);
      }
    }
  };

  const handleLoadExample = (exampleKey: string) => {
    const example = jwtExamples.ejemplos[exampleKey as keyof typeof jwtExamples.ejemplos];
    if (example) {
      setJwtInput(example);
      setDecodeResult(null);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>Decodificador JWT - Labs | AIQUAA</title>
        <meta name="description" content="Decodifica y analiza tokens JWT de forma visual. Verifica expiración, visualiza claims y estructura del token." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Breadcrumb />
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Decodificador JWT
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Decodifica y analiza tokens JWT de forma visual. Verifica la expiración, 
                visualiza los claims y estructura del token de manera clara y organizada.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label htmlFor="jwt-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Token JWT
                </label>
                <textarea
                  id="jwt-input"
                  value={jwtInput}
                  onChange={(e) => setJwtInput(e.target.value)}
                  placeholder="Pega aquí tu token JWT (ej: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c)..."
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none text-gray-900 bg-white"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDecode}
                  disabled={isDecoding}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isDecoding ? 'Decodificando...' : 'Decodificar JWT'}
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Limpiar"
                >
                  🗑️
                </button>
              </div>

              {/* Ejemplos */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">🧪 Ejemplos para Probar:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(jwtExamples.ejemplos).map(([key, token]) => (
                    <button
                      key={key}
                      onClick={() => handleLoadExample(key)}
                      className="text-left p-2 bg-white border border-yellow-200 rounded hover:bg-yellow-100 transition-colors"
                    >
                      <div className="text-sm font-medium text-yellow-800">
                        {jwtExamples.descripciones[key as keyof typeof jwtExamples.descripciones]}
                      </div>
                      <div className="text-xs text-yellow-600 truncate">
                        {token.substring(0, 50)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* JWT Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">ℹ️ Información sobre JWT:</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <div><strong>Header:</strong> Contiene el algoritmo y tipo de token</div>
                  <div><strong>Payload:</strong> Contiene los claims (datos del usuario, expiración, etc.)</div>
                  <div><strong>Signature:</strong> Firma digital para verificar la integridad</div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resultado del Análisis
                </h3>
                
                {decodeResult && (
                  <div className="space-y-4">
                    {decodeResult.success && decodeResult.decoded ? (
                      <>
                        {/* Status */}
                        <div className={`p-4 rounded-lg border ${
                          decodeResult.decoded.isExpired 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">
                              {decodeResult.decoded.isExpired ? '⚠️' : '✅'}
                            </span>
                            <div>
                              <h4 className={`font-semibold ${
                                decodeResult.decoded.isExpired ? 'text-red-800' : 'text-green-800'
                              }`}>
                                {decodeResult.decoded.isExpired ? 'Token Expirado' : 'Token Válido'}
                              </h4>
                              <p className={`text-sm ${
                                decodeResult.decoded.isExpired ? 'text-red-700' : 'text-green-700'
                              }`}>
                                {decodeResult.decoded.isExpired 
                                  ? `Expiró el ${decodeResult.decoded.expirationDate?.toLocaleString('es-ES')}`
                                  : 'El token está vigente'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Header */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">Header</h4>
                            <span className="text-xs text-gray-500">Algoritmo y tipo</span>
                          </div>
                          <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
                            {JSON.stringify(decodeResult.decoded.header, null, 2)}
                          </pre>
                        </div>

                        {/* Payload */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">Payload</h4>
                            <button
                              onClick={handleCopyPayload}
                              className={`text-xs px-2 py-1 rounded transition-colors ${
                                copySuccess 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                              title="Copiar payload al portapapeles"
                            >
                              {copySuccess ? '✅ Copiado' : '📋 Copiar'}
                            </button>
                          </div>
                          <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
                            {JSON.stringify(decodeResult.decoded.payload, null, 2)}
                          </pre>
                          
                          {/* Claims destacados */}
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            {decodeResult.decoded.payload.sub && (
                              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                <strong>Subject:</strong> {decodeResult.decoded.payload.sub}
                              </div>
                            )}
                            {decodeResult.decoded.payload.iat && (
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                <strong>Emitido:</strong> {formatDate(decodeResult.decoded.payload.iat)}
                              </div>
                            )}
                            {decodeResult.decoded.payload.exp && (
                              <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                <strong>Expira:</strong> {formatDate(decodeResult.decoded.payload.exp)}
                              </div>
                            )}
                            {decodeResult.decoded.payload.iss && (
                              <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                <strong>Emisor:</strong> {decodeResult.decoded.payload.iss}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Signature */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">Signature</h4>
                            <span className="text-xs text-gray-500">Firma digital</span>
                          </div>
                          <div className="text-sm text-gray-600 bg-white p-3 rounded border font-mono break-all">
                            {decodeResult.decoded.signature}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            ⚠️ La validación de la firma no se realiza por seguridad
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">❌</span>
                          <div>
                            <h4 className="font-semibold text-red-800">Error al Decodificar</h4>
                            <p className="text-red-700">{decodeResult.error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!decodeResult && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-gray-400 text-4xl mb-4">🔐</div>
                    <p className="text-gray-600">
                      Ingresa un token JWT y haz clic en "Decodificar JWT" para comenzar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JwtDecoder; 