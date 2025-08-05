import { Helmet } from 'react-helmet-async';
import { useAuth } from '../auth/AuthContext';

const TesterZone: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const exclusiveContent = [
    {
      title: '📋 Plantillas Premium',
      description: 'Plantillas de casos de prueba, reportes y documentación',
      items: [
        'Plantilla de Test Cases (Excel)',
        'Reporte de Bugs (Word)',
        'Checklist de Testing (PDF)',
        'Plan de Testing (PowerPoint)'
      ],
      icon: '📄'
    },
    {
      title: '🎓 Cursos Exclusivos',
      description: 'Contenido educativo avanzado solo para miembros',
      items: [
        'Automatización Avanzada con Selenium',
        'Performance Testing con JMeter',
        'Security Testing OWASP',
        'Mobile Testing con Appium'
      ],
      icon: '🎓'
    },
    {
      title: '💬 Comunidad Privada',
      description: 'Acceso a grupos exclusivos y networking',
      items: [
        'Grupo de WhatsApp Premium',
        'Canal de Discord Privado',
        'Meetups Mensuales',
        'Mentorías 1:1'
      ],
      icon: '👥'
    },
    {
      title: '🛠️ Herramientas Premium',
      description: 'Acceso a herramientas y licencias especiales',
      items: [
        'Licencia Katalon Studio Pro',
        'Acceso a BrowserStack',
        'Herramientas de Performance',
        'Software de Reportes'
      ],
      icon: '⚡'
    },
    {
      title: '💰 Descuentos Especiales',
      description: 'Ofertas exclusivas en cursos y herramientas',
      items: [
        '50% off en cursos online',
        '30% off en herramientas',
        'Descuentos en conferencias',
        'Ofertas de empleo premium'
      ],
      icon: '💎'
    },
    {
      title: '📊 Reportes Avanzados',
      description: 'Métricas y análisis detallados de la comunidad',
      items: [
        'Tendencias del mercado QA',
        'Salarios por región',
        'Herramientas más demandadas',
        'Análisis de competencias'
      ],
      icon: '📈'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Helmet>
          <title>Zona Tester - Aiquaa</title>
          <meta name="description" content="Contenido exclusivo para testers registrados" />
        </Helmet>

        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Zona Exclusiva para Testers
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Este contenido está reservado solo para miembros registrados de nuestra comunidad
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🎁 ¿Qué obtienes al registrarte?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {exclusiveContent.slice(0, 4).map((content, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-2xl">{content.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-800">{content.title}</h3>
                      <p className="text-sm text-gray-600">{content.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full md:w-auto">
                🚀 Registrarse Ahora
              </button>
              <div className="text-sm text-gray-500">
                ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 hover:text-blue-800">Inicia sesión</a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📊 Estadísticas de la Comunidad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">Miembros registrados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-gray-600">Nuevos este mes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">92%</div>
                  <div className="text-sm text-gray-600">Satisfacción</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Zona Tester - Aiquaa</title>
        <meta name="description" content="Contenido exclusivo para testers registrados" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 ¡Bienvenido a la Zona Tester!
          </h1>
          <p className="text-xl text-gray-600">
            Disfruta de todo el contenido exclusivo disponible para nuestra comunidad
          </p>
          <div className="mt-4 flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">Sesión activa</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exclusiveContent.map((content, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{content.icon}</span>
                <h3 className="text-lg font-semibold text-gray-800">{content.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{content.description}</p>
              
              <ul className="space-y-2 mb-6">
                {content.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
                Acceder
              </button>
            </div>
          ))}
        </div>

        {/* Sección de eventos próximos */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📅 Próximos Eventos Exclusivos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Webinar: Automatización Avanzada',
                date: '15 de Diciembre',
                time: '19:00 - 21:00',
                attendees: '89 registrados',
                status: 'Próximo'
              },
              {
                title: 'Meetup: Performance Testing',
                date: '22 de Diciembre',
                time: '18:00 - 20:00',
                attendees: '45 registrados',
                status: 'Próximo'
              },
              {
                title: 'Workshop: Security Testing',
                date: '29 de Diciembre',
                time: '14:00 - 17:00',
                attendees: '67 registrados',
                status: 'Próximo'
              }
            ].map((event, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-800 mb-2">{event.title}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>📅 {event.date}</div>
                  <div>🕒 {event.time}</div>
                  <div>👥 {event.attendees}</div>
                </div>
                <div className="mt-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {event.status}
                  </span>
                </div>
                <button className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm">
                  Registrarse
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de recursos descargables */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📥 Recursos Descargables
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Test Case Template.xlsx', size: '2.3 MB', downloads: '1,247' },
              { name: 'Bug Report Template.docx', size: '1.8 MB', downloads: '892' },
              { name: 'Testing Checklist.pdf', size: '3.1 MB', downloads: '1,156' },
              { name: 'Performance Test Plan.pptx', size: '4.2 MB', downloads: '567' }
            ].map((resource, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">{resource.name}</h3>
                    <p className="text-xs text-gray-500">{resource.size}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{resource.downloads} descargas</span>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesterZone; 