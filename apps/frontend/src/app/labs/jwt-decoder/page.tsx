'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/common';
import { useTheme } from '@/contexts/ThemeContext';

interface DecodedJwtResult {
  header: any;
  payload: any;
  signature: string;
  isValid: boolean;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
  isActive?: boolean;
  error?: string;
}

export default function JwtDecoderPage() {
  const { isDarkMode } = useTheme();
  const [jwtToken, setJwtToken] = useState('');
  const [decodedJwt, setDecodedJwt] = useState<DecodedJwtResult | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  
  const outputRef = useRef<HTMLDivElement>(null);

  // Ejemplo de JWT válido para pruebas
  const exampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODUwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  useEffect(() => {
    // Cargar ejemplo inicial
    setJwtToken(exampleJwt);
  }, []);

  const decodeJwt = (token: string): DecodedJwtResult | null => {
    try {
      // Verificar formato básico del JWT
      if (!token || !token.includes('.')) {
        return {
          header: null,
          payload: null,
          signature: '',
          isValid: false,
          error: 'Formato JWT inválido. Debe contener 3 secciones separadas por puntos.'
        };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          header: null,
          payload: null,
          signature: '',
          isValid: false,
          error: 'JWT debe tener exactamente 3 secciones: header.payload.signature'
        };
      }

      // Decodificar header
      let header;
      try {
        // Agregar padding si es necesario para Base64
        const paddedHeader = parts[0] + '='.repeat((4 - parts[0].length % 4) % 4);
        header = JSON.parse(atob(paddedHeader));
      } catch {
        return {
          header: null,
          payload: null,
          signature: '',
          isValid: false,
          error: 'Header JWT inválido o corrupto'
        };
      }

      // Decodificar payload
      let payload;
      try {
        // Agregar padding si es necesario para Base64
        const paddedPayload = parts[1] + '='.repeat((4 - parts[1].length % 4) % 4);
        payload = JSON.parse(atob(paddedPayload));
      } catch {
        return {
          header: null,
          payload: null,
          signature: '',
          isValid: false,
          error: 'Payload JWT inválido o corrupto'
        };
      }

      // Verificar expiración
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      const isExpiringSoon = payload.exp && (payload.exp - now) < 300; // 5 minutos

      // Verificar si el token está activo
      const isActive = !payload.exp || payload.exp > now;

      return {
        header,
        payload,
        signature: parts[2],
        isValid: true,
        isExpired,
        isExpiringSoon,
        isActive
      };
    } catch (error) {
      return {
        header: null,
        payload: null,
        signature: '',
        isValid: false,
        error: `Error al decodificar JWT: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  };

  const handleDecode = () => {
    if (jwtToken.trim() === '') {
      setDecodedJwt(null);
      return;
    }

    const result = decodeJwt(jwtToken.trim());
    setDecodedJwt(result);
    
    if (result?.isValid) {
      setAlertMessage('JWT decodificado correctamente');
      setAlertType('success');
      setShowAlert(true);
      
      // Scroll automático al resultado
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setAlertMessage(result?.error || 'Error al decodificar JWT');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlertMessage('¡Copiado al portapapeles!');
    setAlertType('success');
    setShowAlert(true);
    
    // Ocultar alerta después de 2 segundos
    setTimeout(() => setShowAlert(false), 2000);
  };

  const clearAll = () => {
    setJwtToken('');
    setDecodedJwt(null);
    setShowAlert(false);
  };

  const resetToExample = () => {
    setJwtToken(exampleJwt);
    setDecodedJwt(null);
    setShowAlert(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
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

  const getTimeRemaining = (exp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = exp - now;
    
    if (remaining <= 0) return 'Expirado';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getStatusColor = (isExpired: boolean, isExpiringSoon: boolean) => {
    if (isExpired) return 'text-red-600 bg-red-100 border-red-200';
    if (isExpiringSoon) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  const getStatusText = (isExpired: boolean, isExpiringSoon: boolean) => {
    if (isExpired) return '❌ Expirado';
    if (isExpiringSoon) return '⚠️ Expirando pronto';
    return '✅ Activo';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJwtToken(e.target.value);
    // Limpiar estado de decodificación al cambiar el input
    if (decodedJwt !== null) {
      setDecodedJwt(null);
      setShowAlert(false);
    }
  };

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link href="/labs" className={`transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-brand-muted hover:text-brand-text'
            }`}>
              ← Volver a Labs
            </Link>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            🔐 Decodificador JWT
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Decodifica y analiza tokens JWT. Verifica expiración, validez y contenido de tus tokens de autenticación.
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
              <h2 className="text-xl font-bold text-brand-text mb-4">Token JWT</h2>
              
              <div className="mb-6">
                <label htmlFor="jwt-input" className="block text-sm font-medium text-brand-text mb-2">
                  Ingresa tu token JWT
                </label>
                <textarea
                  id="jwt-input"
                  value={jwtToken}
                  onChange={handleInputChange}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent font-mono text-sm resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDecode}
                  disabled={!jwtToken.trim()}
                  className="flex-1 bg-brand-accent hover:bg-brand-primary disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  🔓 Decodificar JWT
                </button>
                <button
                  onClick={resetToExample}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  🔄 Ejemplo
                </button>
                <button
                  onClick={clearAll}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  🗑️ Limpiar
                </button>
              </div>

              {/* Token Info */}
              {jwtToken && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <div>Longitud: {jwtToken.length} caracteres</div>
                    <div>Secciones: {jwtToken.split('.').length}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Output Section - Siempre visible */}
          <div className="space-y-6" ref={outputRef}>
            {decodedJwt ? (
              <div className="space-y-6">
                {/* Status */}
                {decodedJwt.isValid && (
                  <div className={`p-4 rounded-lg border ${getStatusColor(decodedJwt.isExpired || false, decodedJwt.isExpiringSoon || false)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {getStatusText(decodedJwt.isExpired || false, decodedJwt.isExpiringSoon || false)}
                      </span>
                      {decodedJwt.payload?.exp && (
                        <span className="text-sm">
                          {getTimeRemaining(decodedJwt.payload.exp)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {!decodedJwt.isValid && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-800 font-medium">Error de decodificación</span>
                    </div>
                    <p className="text-red-700 text-sm mt-2">{decodedJwt.error}</p>
                  </div>
                )}

                {/* Header */}
                {decodedJwt.header && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-brand-text">
                        Header
                      </label>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(decodedJwt.header, null, 2))}
                        className="text-brand-accent hover:text-brand-primary text-sm font-medium transition-colors"
                      >
                        📋 Copiar
                      </button>
                    </div>
                    <textarea
                      value={JSON.stringify(decodedJwt.header, null, 2)}
                      readOnly
                      className="w-full h-32 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
                    />
                  </div>
                )}

                {/* Payload */}
                {decodedJwt.payload && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-brand-text">
                        Payload
                      </label>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(decodedJwt.payload, null, 2))}
                        className="text-brand-accent hover:text-brand-primary text-sm font-medium transition-colors"
                      >
                        📋 Copiar
                      </button>
                    </div>
                    <textarea
                      value={JSON.stringify(decodedJwt.payload, null, 2)}
                      readOnly
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
                    />
                  </div>
                )}

                {/* Signature */}
                {decodedJwt.signature && (
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">
                      Signature
                    </label>
                    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm break-all">
                      {decodedJwt.signature}
                    </div>
                  </div>
                )}

                {/* Payload Details */}
                {decodedJwt.payload && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-brand-text mb-4">Información del Token</h3>
                    
                    <div className="space-y-3">
                      {decodedJwt.payload.iss && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Issuer (ISS):</span>
                          <span className="font-mono text-sm">{decodedJwt.payload.iss}</span>
                        </div>
                      )}
                      
                      {decodedJwt.payload.sub && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subject (SUB):</span>
                          <span className="font-mono text-sm">{decodedJwt.payload.sub}</span>
                        </div>
                      )}
                      
                      {decodedJwt.payload.aud && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Audience (AUD):</span>
                          <span className="font-mono text-sm">{decodedJwt.payload.aud}</span>
                        </div>
                      )}
                      
                      {decodedJwt.payload.iat && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Issued At (IAT):</span>
                          <span className="font-mono text-sm">{formatDate(decodedJwt.payload.iat)}</span>
                        </div>
                      )}
                      
                      {decodedJwt.payload.exp && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expires At (EXP):</span>
                          <span className="font-mono text-sm">{formatDate(decodedJwt.payload.exp)}</span>
                        </div>
                      )}
                      
                      {decodedJwt.payload.nbf && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Not Before (NBF):</span>
                          <span className="font-mono text-sm">{formatDate(decodedJwt.payload.nbf)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-xl font-semibold text-brand-text mb-2">
                  Ingresa un token JWT
                </h3>
                <p className="text-brand-muted">
                  Pega tu token JWT en el campo de la izquierda y haz clic en &quot;Decodificar JWT&quot; para ver su contenido.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            ¿Por qué usar nuestro Decodificador JWT?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Decodificación Instantánea</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Decodifica tokens JWT en tiempo real sin enviar datos al servidor
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Verificación de Expiración</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Verifica si tu token está activo, expirando pronto o ya expiró
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Análisis Detallado</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Visualiza header, payload y signature de forma clara y organizada
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            Casos de Uso Comunes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-text">Desarrollo y Testing</h3>
              <ul className="space-y-2 text-brand-muted">
                <li>• Verificar contenido de tokens durante desarrollo</li>
                <li>• Debuggear problemas de autenticación</li>
                <li>• Validar claims y permisos</li>
                <li>• Verificar expiración de tokens</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-text">Seguridad y Auditoría</h3>
              <ul className="space-y-2 text-brand-muted">
                <li>• Auditar tokens de producción</li>
                <li>• Verificar configuración de seguridad</li>
                <li>• Analizar tokens sospechosos</li>
                <li>• Validar implementación de JWT</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
