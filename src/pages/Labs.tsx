import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Labs = () => {
  const tools = [
    {
      title: 'Validador de YAML',
      description: 'Valida la sintaxis y estructura de archivos YAML',
      path: '/labs/yaml-validator',
      icon: '🔍',
      color: 'bg-blue-500'
    },
    {
      title: 'Validador de CronTab',
      description: 'Valida expresiones cron y visualiza próximas ejecuciones',
      path: '/labs/crontab-validator',
      icon: '⏰',
      color: 'bg-green-500'
    },
    {
      title: 'Generador SQL',
      description: 'Genera pasos de compilación para objetos SQL con dependencias',
      path: '/labs/sql-generator',
      icon: '🗄️',
      color: 'bg-purple-500'
    },
    {
      title: 'Validador de JSON',
      description: 'Valida la estructura de casos de prueba en formato JSON',
      path: '/labs/json-validator',
      icon: '📋',
      color: 'bg-orange-500'
    },
    {
      title: 'Generador de Datos',
      description: 'Genera datos de prueba aleatorios para testing',
      path: '/labs/data-generator',
      icon: '🎲',
      color: 'bg-indigo-500'
    },
    {
      title: 'Checklist de Pruebas',
      description: 'Checklist interactiva para procesos de testing',
      path: '/labs/checklist',
      icon: '✅',
      color: 'bg-pink-500'
    },
    {
      title: 'Decodificador Base64',
      description: 'Convierte cadenas codificadas en Base64 a texto plano',
      path: '/labs/base64-decoder',
      icon: '🔓',
      color: 'bg-teal-500'
    },
    {
      title: 'Decodificador JWT',
      description: 'Decodifica y analiza tokens JWT de forma visual',
      path: '/labs/jwt-decoder',
      icon: '🔐',
      color: 'bg-red-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Labs - Herramientas para Testers | AIQUAA</title>
        <meta name="description" content="Labs de AIQUAA: Colección de herramientas útiles para testers y automatizadores. Validador de JSON, YAML, generador de datos, checklist de pruebas y más." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🧪 AIQUAA Labs
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Laboratorio de herramientas útiles para testers, desarrolladores y DBA. 
                Valida YAML, JSON, cron expressions, genera datos de prueba y más.
              </p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <Link
                key={index}
                to={tool.path}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300">
                  <div className="flex items-center mb-4">
                    <div className={`${tool.color} text-white p-3 rounded-lg text-2xl mr-4`}>
                      {tool.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 font-medium">
                    <span>Explorar herramienta</span>
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🧪 ¿Qué encontrarás en nuestros Labs?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🎯 Herramientas Especializadas
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Validador de YAML para archivos de configuración</li>
                  <li>• Validador de CronTab para programación de tareas</li>
                  <li>• Generador de pasos SQL con dependencias</li>
                  <li>• Validador de JSON para casos de prueba</li>
                  <li>• Generador de datos de prueba aleatorios</li>
                  <li>• Checklist interactiva para procesos QA</li>
                  <li>• Decodificador Base64 para análisis de datos</li>
                  <li>• Decodificador JWT para análisis de tokens</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🚀 Características
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Interfaz intuitiva y moderna</li>
                  <li>• Validación en tiempo real</li>
                  <li>• Exportación de resultados</li>
                  <li>• Diseño responsive</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Herramientas Básicas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🧪 Herramientas del Laboratorio
            </h2>
            <p className="text-gray-600 mb-8">
              Utilidades rápidas para tareas comunes de testing y desarrollo.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Validador YAML Básico */}
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">📄</span>
                  <h3 className="text-xl font-semibold text-gray-800">Validador YAML</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Valida la sintaxis de tus archivos YAML y obtén información detallada sobre errores
                </p>
                <Link
                  to="/labs/yaml-validator"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span>Usar validador</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Encodeador Base64 Básico */}
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">🔐</span>
                  <h3 className="text-xl font-semibold text-gray-800">Encodeador Base64</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Codifica texto a Base64 o decodifica contenido Base64 a texto plano
                </p>
                <Link
                  to="/labs/base64-decoder"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span>Usar encodeador</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Tips y mejores prácticas */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                💡 Tips para Testers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">📄 YAML:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Usa espacios, no tabs para indentación</li>
                    <li>• Mantén consistencia en la indentación</li>
                    <li>• Usa comillas para strings con caracteres especiales</li>
                    <li>• Valida siempre antes de usar en producción</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🔐 Base64:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Útil para codificar datos binarios en texto</li>
                    <li>• No es encriptación, solo codificación</li>
                    <li>• Aumenta el tamaño en ~33%</li>
                    <li>• Usa para headers de autorización</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Labs; 