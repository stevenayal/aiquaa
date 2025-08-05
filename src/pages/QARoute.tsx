import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface LearningBlock {
  id: string;
  name: string;
  resource: {
    type: 'video' | 'link' | 'template' | 'pdf';
    url: string;
    title: string;
  };
  level: 'beginner' | 'intermediate' | 'advanced';
}

const learningBlocks: LearningBlock[] = [
  // Principiante
  {
    id: 'qa-basics',
    name: 'Fundamentos de QA',
    resource: {
      type: 'video',
      url: 'https://www.youtube.com/watch?v=example1',
      title: 'Introducción a QA Testing'
    },
    level: 'beginner'
  },
  {
    id: 'manual-testing',
    name: 'Testing Manual Básico',
    resource: {
      type: 'link',
      url: 'https://www.guru99.com/manual-testing.html',
      title: 'Guía completa de testing manual'
    },
    level: 'beginner'
  },
  {
    id: 'test-cases',
    name: 'Creación de Casos de Prueba',
    resource: {
      type: 'template',
      url: '/templates/test-case-template.xlsx',
      title: 'Plantilla de casos de prueba'
    },
    level: 'beginner'
  },
  // Intermedio
  {
    id: 'automation-basics',
    name: 'Automatización Básica',
    resource: {
      type: 'video',
      url: 'https://www.youtube.com/watch?v=example2',
      title: 'Selenium WebDriver básico'
    },
    level: 'intermediate'
  },
  {
    id: 'api-testing',
    name: 'Testing de APIs',
    resource: {
      type: 'link',
      url: 'https://restfulapi.net/testing-rest-api/',
      title: 'Guía de testing de APIs REST'
    },
    level: 'intermediate'
  },
  {
    id: 'performance-basics',
    name: 'Performance Testing Intro',
    resource: {
      type: 'pdf',
      url: '/resources/performance-testing-guide.pdf',
      title: 'Guía de performance testing'
    },
    level: 'intermediate'
  },
  // Avanzado
  {
    id: 'advanced-automation',
    name: 'Automatización Avanzada',
    resource: {
      type: 'video',
      url: 'https://www.youtube.com/watch?v=example3',
      title: 'Patrones de automatización avanzados'
    },
    level: 'advanced'
  },
  {
    id: 'security-testing',
    name: 'Security Testing',
    resource: {
      type: 'link',
      url: 'https://owasp.org/www-project-web-security-testing-guide/',
      title: 'OWASP Testing Guide'
    },
    level: 'advanced'
  },
  {
    id: 'ci-cd-testing',
    name: 'Testing en CI/CD',
    resource: {
      type: 'template',
      url: '/templates/ci-cd-pipeline.yml',
      title: 'Pipeline de CI/CD para testing'
    },
    level: 'advanced'
  }
];

const QARoute: React.FC = () => {
  const [completedBlocks, setCompletedBlocks] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('qa-completed-blocks');
    if (saved) {
      setCompletedBlocks(JSON.parse(saved));
    }
  }, []);

  const toggleCompleted = (blockId: string) => {
    const newCompleted = completedBlocks.includes(blockId)
      ? completedBlocks.filter(id => id !== blockId)
      : [...completedBlocks, blockId];
    
    setCompletedBlocks(newCompleted);
    localStorage.setItem('qa-completed-blocks', JSON.stringify(newCompleted));
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'link': return '🔗';
      case 'template': return '📄';
      case 'pdf': return '📚';
      default: return '📖';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 border-green-300';
      case 'intermediate': return 'bg-yellow-100 border-yellow-300';
      case 'advanced': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getLevelTitle = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return level;
    }
  };

  const levels = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Ruta de Aprendizaje QA - Aiquaa</title>
        <meta name="description" content="Ruta interactiva de aprendizaje para QA Testing con recursos organizados por nivel" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Ruta de Aprendizaje QA
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sigue esta ruta estructurada para convertirte en un tester profesional. 
            Completa los bloques y marca tu progreso.
          </p>
          <div className="mt-6 flex justify-center items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Principiante</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Intermedio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Avanzado</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {levels.map(level => (
            <div key={level} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className={`px-6 py-4 ${getLevelColor(level)} border-b`}>
                <h2 className="text-2xl font-bold text-gray-800">
                  {getLevelTitle(level)}
                </h2>
                <p className="text-gray-600 mt-1">
                  {level === 'beginner' && 'Conceptos fundamentales y herramientas básicas'}
                  {level === 'intermediate' && 'Automatización y técnicas avanzadas'}
                  {level === 'advanced' && 'Especialización y mejores prácticas'}
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {learningBlocks
                    .filter(block => block.level === level)
                    .map(block => (
                      <div 
                        key={block.id}
                        className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                          completedBlocks.includes(block.id) 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-800">
                            {block.name}
                          </h3>
                          <span className="text-2xl">
                            {getResourceIcon(block.resource.type)}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <a 
                            href={block.resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {block.resource.title}
                          </a>
                        </div>

                        <button
                          onClick={() => toggleCompleted(block.id)}
                          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            completedBlocks.includes(block.id)
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {completedBlocks.includes(block.id) ? '✅ Completado' : 'Marcar como completado'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📊 Tu Progreso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levels.map(level => {
              const levelBlocks = learningBlocks.filter(block => block.level === level);
              const completedCount = levelBlocks.filter(block => 
                completedBlocks.includes(block.id)
              ).length;
              const percentage = Math.round((completedCount / levelBlocks.length) * 100);
              
              return (
                <div key={level} className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {completedCount}/{levelBlocks.length}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {getLevelTitle(level)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        level === 'beginner' ? 'bg-green-500' :
                        level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage}% completado
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QARoute; 