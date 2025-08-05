import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { getPageSEO } from '../config/seo';
import FeaturedMember from '../components/Team/FeaturedMember';
import NewsletterSignup from '../components/NewsletterSignup';
import FAQSection from '../components/FAQSection';

const Home = () => {
  const seoData = getPageSEO('home');

  return (
    <>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
      />
      
      <div>
        {/* Hero Section - Redesigned */}
        <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Herramientas para QA en Paraguay - AIQUAA
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300">
              Desde validadores de JSON hasta generadores de datos: todo lo que necesitás para automatizar, validar y crecer como QA. Gratis, en español y hecho por testers locales para testers arriero porte.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/labs"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                🚀 Empezar a Usar Herramientas
              </Link>
              <a href="#testimonios" className="text-indigo-400 hover:underline mt-2 sm:mt-0">
                Ver qué dicen otros testers →
              </a>
            </div>

            <div className="mt-8 text-sm text-green-400">
              ✅ Ya usamos estas herramientas en +20 proyectos reales en Paraguay
            </div>
          </div>
        </section>

        {/* Urgency Message */}
        <div className="bg-yellow-300 text-black py-2 px-4 text-center text-sm font-semibold">
          📢 ¡Estamos en fase piloto! Usá las herramientas, compartí feedback y ayudanos a construir la comunidad de QA más fuerte de Paraguay.
        </div>

        {/* Testimonials Section */}
        <section id="testimonios" className="bg-slate-800 text-white py-10">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Lo que dicen quienes ya usan AIQUAA:</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p>"Me ahorró horas validando respuestas de API. Todo en español y sin pagar nada."</p>
                <span className="block mt-2 text-sm text-gray-300">— Ana, QA Manual</span>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p>"Usé el generador de datos para una demo y funcionó al toque. Muy útil."</p>
                <span className="block mt-2 text-sm text-gray-300">— Luis, Automatizador</span>
              </div>
            </div>
          </div>
        </section>

        {/* Presentación Institucional */}
        <section className="bg-brand-light py-12 md:py-16 px-4 md:px-6 text-center shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-accent mb-4">¿Qué es AIQUAA?</h2>
          <p className="text-base md:text-lg max-w-3xl mx-auto text-brand-text mb-6 px-4">
            AIQUAA es una iniciativa paraguaya que fusiona conocimiento local con innovación global en testing de software. 
            Inspirada en el término guaraní "aikuaa" —que significa saber o conocer—, nuestra misión es construir una comunidad 
            comprometida con la calidad, la capacitación constante y la excelencia profesional. Combinamos inteligencia artificial (AI) 
            con aseguramiento de calidad (QA) para transformar el testing en Paraguay y en la región.
          </p>
          <p className="text-sm md:text-base lg:text-lg max-w-4xl mx-auto text-brand-text px-4">
            <strong>AIQUAA es una comunidad de testing y calidad de software en Paraguay.</strong> Brindamos recursos, mentorías, eventos y contenido sobre automatización, buenas prácticas y formación en QA. Nuestras herramientas gratuitas incluyen validador de JSON, generador de datos, checklist de pruebas, decodificador Base64 y decodificador JWT, diseñadas específicamente para testers funcionales, automatizadores y QA manual.
          </p>
        </section>

        {/* Herramientas Labs Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">
                💡 Herramientas Gratuitas para Testers
              </h2>
              <p className="text-base md:text-lg text-brand-text px-4">
                Explorá nuestras utilidades web para testers funcionales, automatizadores y QA manual
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Validador de JSON */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">🔍</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Validador de JSON</h3>
                  <p className="text-sm md:text-base text-blue-100">Valida y formatea archivos JSON para testing de APIs</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Herramienta esencial para validar respuestas de APIs, configuraciones y datos de prueba. 
                    Formatea automáticamente y detecta errores de sintaxis.
                  </p>
                  <Link
                    to="/labs/json-validator"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Generador de Datos */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">🎲</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Generador de Datos</h3>
                  <p className="text-sm md:text-base text-green-100">Genera datos de prueba personalizados para tus tests</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Crea datos de prueba realistas para diferentes escenarios. 
                    Genera nombres, emails, fechas, números y más para automatizar tus pruebas.
                  </p>
                  <Link
                    to="/labs/data-generator"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Checklist de Pruebas */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">✅</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Checklist de Pruebas</h3>
                  <p className="text-sm md:text-base text-purple-100">Organiza y gestiona tus casos de prueba</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Crea y gestiona checklists de pruebas personalizados. 
                    Organiza tus casos de prueba por funcionalidad y prioridad.
                  </p>
                  <Link
                    to="/labs/checklist"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Decodificador Base64 */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">🔓</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Decodificador Base64</h3>
                  <p className="text-sm md:text-base text-orange-100">Codifica y decodifica texto en Base64</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Herramienta útil para trabajar con datos codificados en Base64. 
                    Ideal para testing de APIs y análisis de datos.
                  </p>
                  <Link
                    to="/labs/base64-decoder"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Decodificador JWT */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">🔐</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Decodificador JWT</h3>
                  <p className="text-sm md:text-base text-red-100">Decodifica y analiza tokens JWT</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Analiza tokens JWT para debugging y testing de autenticación. 
                    Visualiza headers, payload y verifica la firma.
                  </p>
                  <Link
                    to="/labs/jwt-decoder"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Ver Todas las Herramientas */}
              <div className="bg-gradient-to-br from-brand to-brand-accent rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-4 md:p-6 text-center text-brand-light">
                  <div className="text-3xl md:text-4xl mb-4">🚀</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Más Herramientas</h3>
                  <p className="text-sm md:text-base text-brand-light/90 mb-4 md:mb-6">
                    Descubrí todas nuestras herramientas y recursos para testers
                  </p>
                  <Link
                    to="/labs"
                    className="inline-flex items-center justify-center w-full bg-brand-light text-brand-dark hover:bg-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Ver Todas →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles - TEMPORARILY HIDDEN */}
        {/* 
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-text mb-4">
                Artículos Destacados
              </h2>
              <p className="text-lg text-brand-text">
                Descubre nuestros artículos más populares sobre testing y QA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="bg-brand text-brand-light text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold text-brand-text mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-brand-text mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <Link
                        to={`/article/${post.slug}`}
                        className="text-brand hover:text-brand-accent font-medium transition-colors duration-200"
                      >
                        Leer más →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/blog"
                className="btn-primary"
              >
                Ver Todos los Artículos
              </Link>
            </div>
          </div>
        </section>
        */}

        {/* Nuevas Funcionalidades Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">
                🚀 Nuevas Funcionalidades
              </h2>
              <p className="text-base md:text-lg text-brand-text px-4">
                Descubre las últimas herramientas y funcionalidades para potenciar tu carrera en QA
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Ruta de Aprendizaje */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">🎯</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Ruta de Aprendizaje QA</h3>
                  <p className="text-sm md:text-base text-green-100">Ruta interactiva organizada por niveles</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Sigue una ruta estructurada desde principiante hasta avanzado. Marca tu progreso y accede a recursos exclusivos.
                  </p>
                  <Link
                    to="/ruta-qa"
                    className="inline-flex items-center justify-center w-full bg-green-600 text-white hover:bg-green-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Comenzar ruta →
                  </Link>
                </div>
              </div>

              {/* Recomendador de Herramientas */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">🛠️</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Recomendador de Herramientas</h3>
                  <p className="text-sm md:text-base text-purple-100">Encuentra la herramienta perfecta</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Responde un cuestionario y obtén recomendaciones personalizadas de herramientas de testing según tu experiencia y necesidades.
                  </p>
                  <Link
                    to="/herramientas-recomendadas"
                    className="inline-flex items-center justify-center w-full bg-purple-600 text-white hover:bg-purple-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Obtener recomendación →
                  </Link>
                </div>
              </div>

              {/* Comunidad */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">💬</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Comunidad de Testers</h3>
                  <p className="text-sm md:text-base text-orange-100">Conecta y comparte experiencias</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Únete a nuestra comunidad activa. Comparte experiencias, haz preguntas y aprende de otros profesionales.
                  </p>
                  <Link
                    to="/comunidad"
                    className="inline-flex items-center justify-center w-full bg-orange-600 text-white hover:bg-orange-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Unirse a la comunidad →
                  </Link>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">📊</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Estadísticas de Comunidad</h3>
                  <p className="text-sm md:text-base text-blue-100">Métricas y tendencias</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Explora las estadísticas de nuestra comunidad, herramientas más populares y tendencias del mercado QA.
                  </p>
                  <Link
                    to="/stats"
                    className="inline-flex items-center justify-center w-full bg-blue-600 text-white hover:bg-blue-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Ver estadísticas →
                  </Link>
                </div>
              </div>

              {/* Herramientas Utiles */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">⚡</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Herramientas Útiles</h3>
                  <p className="text-sm md:text-base text-indigo-100">Validador YAML y Base64</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Validador de YAML y encodeador/decodificador Base64. Herramientas prácticas para tu trabajo diario.
                  </p>
                  <Link
                    to="/herramientas"
                    className="inline-flex items-center justify-center w-full bg-indigo-600 text-white hover:bg-indigo-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Usar herramientas →
                  </Link>
                </div>
              </div>

              {/* Zona Tester */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 md:p-6 text-white">
                  <div className="text-2xl md:text-3xl mb-2">🔒</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Zona Tester</h3>
                  <p className="text-sm md:text-base text-red-100">Contenido exclusivo para miembros</p>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-brand-text mb-4">
                    Accede a contenido exclusivo, plantillas premium, descuentos y recursos avanzados solo para testers registrados.
                  </p>
                  <Link
                    to="/zona-tester"
                    className="inline-flex items-center justify-center w-full bg-red-600 text-white hover:bg-red-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Acceder a zona exclusiva →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NewsletterSignup />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-brand-light py-12 md:py-16 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">
                ¿Por qué AIQUAA?
              </h2>
              <p className="text-base md:text-lg text-brand-text px-4">
                Nuestro compromiso con la excelencia en testing de software
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="bg-brand w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-brand-text mb-2">
                  Experiencia Comprobada
                </h3>
                <p className="text-sm md:text-base text-brand-text">
                  Más de 6 años de experiencia en testing de software y automatización
                </p>
              </div>

              <div className="text-center">
                <div className="bg-brand w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-brand-text mb-2">
                  Herramientas Gratuitas
                </h3>
                <p className="text-sm md:text-base text-brand-text">
                  Utilidades web diseñadas específicamente para la comunidad QA
                </p>
              </div>

              <div className="text-center">
                <div className="bg-brand w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-brand-text mb-2">
                  Comunidad Activa
                </h3>
                <p className="text-sm md:text-base text-brand-text">
                  Únete a nuestra comunidad de profesionales de QA en Paraguay y Latinoamérica
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Featured Member Section */}
        <FeaturedMember />
      </div>
    </>
  );
};

export default Home; 