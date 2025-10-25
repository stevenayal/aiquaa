import { Helmet } from 'react-helmet-async';
import { useTheme } from '../../contexts/ThemeContext';

const JsonToTestPlans = () => {
  const { isDarkMode } = useTheme();

  return (
    <>
      <Helmet>
        <title>JSON to Test Plans - AIQUAA Labs</title>
        <meta name="description" content="Convierte JSON de análisis de IA en archivos CSV para gestión de pruebas" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 text-white rounded-full text-2xl mb-4">
              📊
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              JSON to Test Plans
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Convierte JSON de análisis de IA en archivos CSV para gestión de pruebas
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className={`rounded-xl shadow-lg border p-8 ${
            isDarkMode
              ? 'bg-dark-primary border-dark-secondary'
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-xl mb-4">
                🚀
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Herramienta en Desarrollo
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Esta herramienta está disponible en la versión Next.js de AIQUAA.
                Estamos trabajando para migrarla a esta versión de React.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Características de JSON to Test Plans:
                </h3>
                <ul className="text-left text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Validación robusta con esquema Zod</li>
                  <li>• 4 CSV diferentes: Plans, Steps, Preconditions, Test Data</li>
                  <li>• Opciones flexibles de exportación</li>
                  <li>• Preview interactivo con tablas paginadas</li>
                  <li>• Procesamiento 100% client-side</li>
                  <li>• Soporte para tema oscuro</li>
                  <li>• Persistencia en LocalStorage</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://aiquaa.vercel.app/labs/json-to-testplans"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
                >
                  Ver en Next.js
                </a>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Volver a Labs
                </button>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className={`rounded-lg border p-6 ${
              isDarkMode
                ? 'bg-dark-primary border-dark-secondary'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🔍 Validación Inteligente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Esquema Zod con validación estricta de tipos y mensajes de error detallados.
              </p>
            </div>

            <div className={`rounded-lg border p-6 ${
              isDarkMode
                ? 'bg-dark-primary border-dark-secondary'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📊 Exportación Flexible
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Múltiples formatos CSV con opciones personalizables de delimitadores y encabezados.
              </p>
            </div>

            <div className={`rounded-lg border p-6 ${
              isDarkMode
                ? 'bg-dark-primary border-dark-secondary'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🎯 Preview Interactivo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tablas paginadas para visualizar los datos antes de exportar.
              </p>
            </div>

            <div className={`rounded-lg border p-6 ${
              isDarkMode
                ? 'bg-dark-primary border-dark-secondary'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🔒 Privacidad Total
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todo el procesamiento se realiza en el navegador, sin enviar datos al servidor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JsonToTestPlans;
