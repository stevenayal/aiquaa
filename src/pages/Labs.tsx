import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Labs = () => {
  const tools = [
    {
      title: 'Validador de JSON',
      description: 'Valida la estructura de casos de prueba en formato JSON',
      path: '/labs/json-validator',
      icon: '🔍',
      color: 'bg-blue-500'
    },
    {
      title: 'Generador de Datos',
      description: 'Genera datos de prueba aleatorios para testing',
      path: '/labs/data-generator',
      icon: '🎲',
      color: 'bg-green-500'
    },
    {
      title: 'Checklist de Pruebas',
      description: 'Checklist interactiva para procesos de testing',
      path: '/labs/checklist',
      icon: '✅',
      color: 'bg-purple-500'
    },
    {
      title: 'Decodificador Base64',
      description: 'Convierte cadenas codificadas en Base64 a texto plano',
      path: '/labs/base64-decoder',
      icon: '🔓',
      color: 'bg-orange-500'
    },
    {
      title: 'Decodificador JWT',
      description: 'Decodifica y analiza tokens JWT de forma visual',
      path: '/labs/jwt-decoder',
      icon: '🔐',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Labs - Herramientas para Testers | AIQUAA</title>
        <meta name="description" content="Herramientas útiles para testers y automatizadores. Validador de JSON, generador de datos y checklist de pruebas." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🧪 Labs - Herramientas para Testers
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Colección de herramientas útiles para testers y automatizadores. 
                Valida JSON, genera datos de prueba y mantén checklist organizadas.
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
              ¿Qué encontrarás aquí?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🎯 Herramientas Especializadas
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Validador de JSON para casos de prueba</li>
                  <li>• Generador de datos de prueba aleatorios</li>
                  <li>• Checklist interactiva para procesos QA</li>
                  <li>• Decodificador Base64 para análisis de datos</li>
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
      </div>
    </>
  );
};

export default Labs; 