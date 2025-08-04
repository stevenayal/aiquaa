import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import posts from '../data/posts.json';
import FeaturedMember from '../components/Team/FeaturedMember';
import NewsletterSignup from '../components/NewsletterSignup';

const Home = () => {
  const featuredPosts = posts.slice(0, 3);

  return (
    <>
      <Helmet>
        <title>AIQUAA - Herramientas Gratuitas para Testers</title>
        <meta name="description" content="AIQUAA ofrece herramientas gratuitas para testers funcionales, automatizadores y QA manual. Validador de JSON, generador de datos, checklist de pruebas y más." />
        <meta property="og:title" content="AIQUAA - Herramientas Gratuitas para Testers" />
        <meta property="og:description" content="AIQUAA ofrece herramientas gratuitas para testers funcionales, automatizadores y QA manual. Validador de JSON, generador de datos, checklist de pruebas y más." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div>
        {/* Hero Section */}
        <section className="bg-brand-dark text-brand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/logo1.png" 
                  alt="AIQUAA Logo" 
                  className="h-24 md:h-32 w-auto"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                💡 Herramientas Gratuitas para Testers
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Explorá nuestras utilidades web para testers funcionales, automatizadores y QA manual. 
                Una comunidad paraguaya que une testing, innovación y aprendizaje constante.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/labs"
                  className="bg-brand text-brand-light hover:bg-brand-accent px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Explorar Herramientas
                </Link>
                <Link
                  to="/blog"
                  className="border-2 border-brand-light text-brand-light hover:bg-brand-light hover:text-brand-dark px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Ver Blog
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Presentación Institucional */}
        <section className="bg-brand-light py-16 px-6 text-center shadow-sm">
          <h2 className="text-3xl font-bold text-brand-accent mb-4">¿Qué es AIQUAA?</h2>
          <p className="text-lg max-w-3xl mx-auto text-brand-text">
            AIQUAA es una iniciativa paraguaya que fusiona conocimiento local con innovación global en testing de software. 
            Inspirada en el término guaraní "aikuaa" —que significa saber o conocer—, nuestra misión es construir una comunidad 
            comprometida con la calidad, la capacitación constante y la excelencia profesional. Combinamos inteligencia artificial (AI) 
            con aseguramiento de calidad (QA) para transformar el testing en Paraguay y en la región.
          </p>
        </section>

        {/* Herramientas Labs Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-text mb-4">
                💡 Herramientas Gratuitas para Testers
              </h2>
              <p className="text-lg text-brand-text">
                Explorá nuestras utilidades web para testers funcionales, automatizadores y QA manual
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Validador de JSON */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="text-3xl mb-2">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">Validador de JSON</h3>
                  <p className="text-blue-100">Valida y formatea archivos JSON para testing de APIs</p>
                </div>
                <div className="p-6">
                  <p className="text-brand-text mb-4">
                    Herramienta esencial para validar respuestas de APIs, configuraciones y datos de prueba. 
                    Formatea automáticamente y detecta errores de sintaxis.
                  </p>
                  <Link
                    to="/labs/json-validator"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Generador de Datos */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                  <div className="text-3xl mb-2">🎲</div>
                  <h3 className="text-xl font-semibold mb-2">Generador de Datos</h3>
                  <p className="text-green-100">Genera datos de prueba personalizados para tus tests</p>
                </div>
                <div className="p-6">
                  <p className="text-brand-text mb-4">
                    Crea datos de prueba realistas para diferentes escenarios. 
                    Genera nombres, emails, fechas, números y más para automatizar tus pruebas.
                  </p>
                  <Link
                    to="/labs/data-generator"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Checklist de Pruebas */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                  <div className="text-3xl mb-2">✅</div>
                  <h3 className="text-xl font-semibold mb-2">Checklist de Pruebas</h3>
                  <p className="text-purple-100">Organiza y gestiona tus casos de prueba</p>
                </div>
                <div className="p-6">
                  <p className="text-brand-text mb-4">
                    Crea y gestiona checklists de pruebas personalizados. 
                    Organiza tus casos de prueba por funcionalidad y prioridad.
                  </p>
                  <Link
                    to="/labs/checklist"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Decodificador Base64 */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                  <div className="text-3xl mb-2">🔓</div>
                  <h3 className="text-xl font-semibold mb-2">Decodificador Base64</h3>
                  <p className="text-orange-100">Codifica y decodifica texto en Base64</p>
                </div>
                <div className="p-6">
                  <p className="text-brand-text mb-4">
                    Herramienta útil para trabajar con datos codificados en Base64. 
                    Ideal para testing de APIs y análisis de datos.
                  </p>
                  <Link
                    to="/labs/base64-decoder"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Decodificador JWT */}
              <div className="bg-brand-light rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                  <div className="text-3xl mb-2">🔐</div>
                  <h3 className="text-xl font-semibold mb-2">Decodificador JWT</h3>
                  <p className="text-red-100">Decodifica y analiza tokens JWT</p>
                </div>
                <div className="p-6">
                  <p className="text-brand-text mb-4">
                    Analiza tokens JWT para debugging y testing de autenticación. 
                    Visualiza headers, payload y verifica la firma.
                  </p>
                  <Link
                    to="/labs/jwt-decoder"
                    className="inline-flex items-center justify-center w-full bg-brand text-brand-light hover:bg-brand-accent px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Usar ahora →
                  </Link>
                </div>
              </div>

              {/* Ver Todas las Herramientas */}
              <div className="bg-gradient-to-br from-brand to-brand-accent rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6 text-center text-brand-light">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold mb-2">Más Herramientas</h3>
                  <p className="text-brand-light/90 mb-6">
                    Descubrí todas nuestras herramientas y recursos para testers
                  </p>
                  <Link
                    to="/labs"
                    className="inline-flex items-center justify-center w-full bg-brand-light text-brand-dark hover:bg-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
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

        {/* Newsletter Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <NewsletterSignup />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-brand-light py-16 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-text mb-4">
                ¿Por qué AIQUAA?
              </h2>
              <p className="text-lg text-brand-text">
                Nuestro compromiso con la excelencia en testing de software
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-brand w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-brand-text mb-2">
                  Experiencia Comprobada
                </h3>
                <p className="text-brand-text">
                  Más de 6 años de experiencia en testing de software y automatización
                </p>
              </div>

              <div className="text-center">
                <div className="bg-brand w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-brand-text mb-2">
                  Herramientas Gratuitas
                </h3>
                <p className="text-brand-text">
                  Utilidades web diseñadas específicamente para la comunidad QA
                </p>
              </div>

              <div className="text-center">
                <div className="bg-brand w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-brand-text mb-2">
                  Comunidad Activa
                </h3>
                <p className="text-brand-text">
                  Únete a nuestra comunidad de profesionales de QA en Paraguay y Latinoamérica
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Member Section */}
        <FeaturedMember />
      </div>
    </>
  );
};

export default Home; 