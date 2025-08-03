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
        <title>AIQUAA - Comunidad de Testing, Automatización e IA</title>
        <meta name="description" content="AIQUAA es una comunidad paraguaya que une testing, innovación y aprendizaje constante. Inspirados en 'aikuaa', creamos conocimiento y lo compartimos." />
        <meta property="og:title" content="AIQUAA - Comunidad de Testing, Automatización e IA" />
        <meta property="og:description" content="AIQUAA es una comunidad paraguaya que une testing, innovación y aprendizaje constante. Inspirados en 'aikuaa', creamos conocimiento y lo compartimos." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div>
        {/* Hero Section */}
        <section className="bg-brand-dark text-brand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <img 
                  src="/logo1.png" 
                  alt="AIQUAA Logo" 
                  className="h-24 md:h-32 w-auto"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                AIQUAA Blog
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Una comunidad paraguaya que une testing, innovación y aprendizaje constante. Inspirados en 'aikuaa', creamos conocimiento y lo compartimos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/blog"
                  className="bg-brand text-brand-light hover:bg-brand-accent px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Explorar Artículos
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-brand-light text-brand-light hover:bg-brand-light hover:text-brand-dark px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Conoce Más
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

        {/* Featured Articles */}
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
                  Más de 10 años de experiencia en testing de software y automatización
                </p>
              </div>

              <div className="text-center">
                <div className="bg-brand w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-brand-text mb-2">
                  Contenido Actualizado
                </h3>
                <p className="text-brand-text">
                  Artículos y tutoriales con las últimas tendencias y herramientas
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
                  Únete a nuestra comunidad de profesionales de QA
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