import Link from 'next/link';

export default function LabsPage() {
  const tools = [
    {
      id: 'json-validator',
      name: 'Validador de JSON',
      description: 'Valida y formatea JSON de forma instantánea',
      icon: '🔍',
      color: 'from-blue-500 to-blue-600',
      href: '/labs/json-validator'
    },
    {
      id: 'data-generator',
      name: 'Generador de Datos',
      description: 'Crea datos de prueba para tus tests',
      icon: '📊',
      color: 'from-green-500 to-green-600',
      href: '/labs/data-generator'
    },
    {
      id: 'checklist',
      name: 'Checklist de Pruebas',
      description: 'Listas de verificación para diferentes tipos de testing',
      icon: '✅',
      color: 'from-purple-500 to-purple-600',
      href: '/labs/checklist'
    },
    {
      id: 'base64-converter',
      name: 'Convertidor Base64',
      description: 'Codifica y decodifica texto en Base64',
      icon: '🔄',
      color: 'from-orange-500 to-orange-600',
      href: '/labs/base64-converter'
    },
    {
      id: 'jwt-decoder',
      name: 'Decodificador JWT',
      description: 'Analiza y decodifica tokens JWT',
      icon: '🔐',
      color: 'from-red-500 to-red-600',
      href: '/labs/jwt-decoder'
    },
    {
      id: 'cron-validator',
      name: 'Validador de Cron',
      description: 'Valida expresiones cron y muestra próximas ejecuciones',
      icon: '⏰',
      color: 'from-indigo-500 to-indigo-600',
      href: '/labs/cron-validator'
    },
    {
      id: 'allpairs',
      name: 'All Pairs Generator',
      description: 'Genera casos de prueba pairwise para testing combinatorio',
      icon: '🔀',
      color: 'from-teal-500 to-teal-600',
      href: '/labs/allpairs'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-light py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            🧪 AIQUAA Labs
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Herramientas gratuitas para testers funcionales, automatizadores y QA manual. 
            Todo en español y diseñado específicamente para la comunidad de testing en Paraguay.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-r ${tool.color} p-6 text-white`}>
                <div className="text-3xl mb-3">{tool.icon}</div>
                <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                <p className="text-white/90 text-sm">{tool.description}</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted text-sm">Hacer click para usar</span>
                  <svg 
                    className="w-5 h-5 text-brand-muted group-hover:text-brand-accent transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-text mb-4">
              ¿Por qué usar AIQUAA Labs?
            </h2>
            <p className="text-lg text-brand-muted max-w-2xl mx-auto">
              Nuestras herramientas están diseñadas específicamente para testers, 
              con interfaz en español y funcionalidades que realmente necesitas en tu día a día.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-brand-text mb-3">Gratis y Abierto</h3>
              <p className="text-brand-muted">
                Todas las herramientas son completamente gratuitas y de código abierto.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🇵🇾</div>
              <h3 className="text-xl font-bold text-brand-text mb-3">Hecho en Paraguay</h3>
              <p className="text-brand-muted">
                Desarrollado por testers locales para testers locales.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-brand-text mb-3">Siempre Actualizado</h3>
              <p className="text-brand-muted">
                Nuevas herramientas y mejoras constantes basadas en feedback real.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-brand-accent to-brand-primary rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              ¿Tienes una idea para una nueva herramienta?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              ¡Comparte tu feedback y ayúdanos a construir las herramientas que realmente necesitas!
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-brand-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contactar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
