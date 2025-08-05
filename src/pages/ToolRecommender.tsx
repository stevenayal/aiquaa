import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface Tool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  website: string;
  icon: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  category: string[];
}

const tools: Tool[] = [
  {
    name: 'Cypress',
    description: 'Framework de testing end-to-end moderno para aplicaciones web',
    pros: ['Fácil de aprender', 'Excelente documentación', 'Time travel debugging', 'Soporte nativo para TypeScript'],
    cons: ['Solo para aplicaciones web', 'No soporta múltiples pestañas', 'Limitado a un dominio por test'],
    website: 'https://cypress.io',
    icon: '🟢',
    difficulty: 'Fácil',
    category: ['web', 'beginner']
  },
  {
    name: 'Selenium',
    description: 'Framework de automatización web multiplataforma y multinavegador',
    pros: ['Soporte multi-navegador', 'Gran comunidad', 'Múltiples lenguajes', 'Muy estable'],
    cons: ['Curva de aprendizaje pronunciada', 'Configuración compleja', 'Tests lentos'],
    website: 'https://selenium.dev',
    icon: '🟡',
    difficulty: 'Intermedio',
    category: ['web', 'intermediate']
  },
  {
    name: 'Postman',
    description: 'Plataforma completa para desarrollo y testing de APIs',
    pros: ['Interfaz intuitiva', 'Excelente para APIs', 'Colecciones reutilizables', 'Testing automatizado'],
    cons: ['Limitado a APIs', 'Versión gratuita limitada', 'No es código real'],
    website: 'https://postman.com',
    icon: '🟠',
    difficulty: 'Fácil',
    category: ['api', 'beginner']
  },
  {
    name: 'Appium',
    description: 'Framework de automatización para aplicaciones móviles, web y híbridas',
    pros: ['Multiplataforma (iOS/Android)', 'Lenguaje agnóstico', 'Open source', 'Gran comunidad'],
    cons: ['Configuración compleja', 'Tests lentos', 'Curva de aprendizaje alta'],
    website: 'http://appium.io',
    icon: '📱',
    difficulty: 'Avanzado',
    category: ['mobile', 'advanced']
  },
  {
    name: 'JMeter',
    description: 'Herramienta de testing de performance y carga para aplicaciones web',
    pros: ['Gratuito y open source', 'Muy potente', 'Soporte para múltiples protocolos', 'Reportes detallados'],
    cons: ['Interfaz compleja', 'Curva de aprendizaje alta', 'Recursos intensivos'],
    website: 'https://jmeter.apache.org',
    icon: '⚡',
    difficulty: 'Intermedio',
    category: ['performance', 'intermediate']
  },
  {
    name: 'Playwright',
    description: 'Framework moderno para automatización de navegadores web',
    pros: ['Muy rápido', 'Auto-wait inteligente', 'Soporte multi-navegador', 'Excelente para CI/CD'],
    cons: ['Relativamente nuevo', 'Comunidad más pequeña', 'Documentación en desarrollo'],
    website: 'https://playwright.dev',
    icon: '🎭',
    difficulty: 'Intermedio',
    category: ['web', 'intermediate']
  },
  {
    name: 'RestAssured',
    description: 'Biblioteca Java para testing de APIs REST',
    pros: ['Sintaxis fluida', 'Integración con frameworks Java', 'Muy estable', 'Excelente para APIs'],
    cons: ['Solo para Java', 'Requiere conocimientos de Java', 'Configuración inicial compleja'],
    website: 'https://rest-assured.io',
    icon: '☕',
    difficulty: 'Intermedio',
    category: ['api', 'intermediate']
  },
  {
    name: 'Katalon Studio',
    description: 'Plataforma completa de automatización de testing',
    pros: ['Todo en uno', 'Interfaz gráfica', 'Soporte múltiples tipos de testing', 'Fácil de usar'],
    cons: ['Licencia costosa', 'Menos flexible', 'Vendor lock-in'],
    website: 'https://katalon.com',
    icon: '🎯',
    difficulty: 'Fácil',
    category: ['web', 'api', 'mobile', 'beginner']
  }
];

const ToolRecommender: React.FC = () => {
  const [answers, setAnswers] = useState({
    appType: '',
    experience: '',
    priority: ''
  });
  const [recommendedTools, setRecommendedTools] = useState<Tool[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (question: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const getRecommendations = () => {
    let filteredTools = [...tools];

    // Filtrar por tipo de aplicación
    if (answers.appType) {
      filteredTools = filteredTools.filter(tool => 
        tool.category.includes(answers.appType)
      );
    }

    // Filtrar por experiencia
    if (answers.experience) {
      if (answers.experience === 'no') {
        filteredTools = filteredTools.filter(tool => 
          tool.difficulty === 'Fácil'
        );
      } else if (answers.experience === 'yes') {
        filteredTools = filteredTools.filter(tool => 
          tool.difficulty !== 'Fácil'
        );
      }
    }

    // Ordenar por relevancia
    filteredTools.sort((a, b) => {
      const aScore = a.category.length; // Más categorías = más versátil
      const bScore = b.category.length;
      return bScore - aScore;
    });

    setRecommendedTools(filteredTools.slice(0, 3));
    setShowResults(true);
  };

  const resetQuiz = () => {
    setAnswers({
      appType: '',
      experience: '',
      priority: ''
    });
    setRecommendedTools([]);
    setShowResults(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'text-green-600 bg-green-100';
      case 'Intermedio': return 'text-yellow-600 bg-yellow-100';
      case 'Avanzado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Recomendador de Herramientas - Aiquaa</title>
        <meta name="description" content="Encuentra la herramienta de testing perfecta para tu proyecto" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛠️ Recomendador de Herramientas
          </h1>
          <p className="text-xl text-gray-600">
            Responde estas preguntas y te recomendaremos las mejores herramientas para tu proyecto
          </p>
        </div>

        {!showResults ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8">
              {/* Pregunta 1 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  1. ¿Qué tipo de aplicación estás testeando?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'web', label: '🌐 Aplicación Web', desc: 'Sitios web, aplicaciones SPA' },
                    { value: 'api', label: '🔌 API/REST', desc: 'Servicios web, microservicios' },
                    { value: 'mobile', label: '📱 Aplicación Móvil', desc: 'Apps iOS/Android' },
                    { value: 'desktop', label: '💻 Aplicación Desktop', desc: 'Software de escritorio' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer('appType', option.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        answers.appType === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregunta 2 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  2. ¿Tenés experiencia con automatización de testing?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'no', label: '❌ No tengo experiencia', desc: 'Soy principiante en automatización' },
                    { value: 'yes', label: '✅ Sí tengo experiencia', desc: 'Ya he trabajado con herramientas de testing' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer('experience', option.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        answers.experience === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregunta 3 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  3. ¿Qué es más importante para vos?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'easy', label: '🎯 Fácil de aprender', desc: 'Herramientas intuitivas' },
                    { value: 'powerful', label: '⚡ Muy potente', desc: 'Funcionalidades avanzadas' },
                    { value: 'community', label: '👥 Gran comunidad', desc: 'Mucho soporte disponible' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer('priority', option.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        answers.priority === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón de resultados */}
              <div className="text-center pt-6">
                <button
                  onClick={getRecommendations}
                  disabled={!answers.appType || !answers.experience || !answers.priority}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  🎯 Obtener Recomendaciones
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Resultados */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Tus Herramientas Recomendadas
                </h2>
                <p className="text-gray-600">
                  Basado en tus respuestas, estas son las mejores opciones para tu proyecto
                </p>
              </div>

              <div className="space-y-6">
                {recommendedTools.map((tool, index) => (
                  <div key={tool.name} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{tool.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{tool.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tool.difficulty)}`}>
                            {tool.difficulty}
                          </span>
                        </div>
                      </div>
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Visitar sitio →
                      </a>
                    </div>

                    <p className="text-gray-600 mb-4">{tool.description}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">✅ Ventajas</h4>
                        <ul className="space-y-1">
                          {tool.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center">
                              <span className="text-green-500 mr-2">•</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2">❌ Desventajas</h4>
                        <ul className="space-y-1">
                          {tool.cons.map((con, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center">
                              <span className="text-red-500 mr-2">•</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ver más herramientas */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🔍 ¿Querés ver más herramientas similares?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools
                  .filter(tool => !recommendedTools.find(rec => rec.name === tool.name))
                  .slice(0, 6)
                  .map(tool => (
                    <div key={tool.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{tool.icon}</span>
                        <h4 className="font-semibold text-gray-800">{tool.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tool.difficulty)}`}>
                          {tool.difficulty}
                        </span>
                        <a
                          href={tool.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver más →
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Botón de reinicio */}
            <div className="text-center">
              <button
                onClick={resetQuiz}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                🔄 Hacer otro test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolRecommender; 