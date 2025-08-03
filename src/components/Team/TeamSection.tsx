import StevenAyala from './StevenAyala';

const TeamSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral mb-4">
            Nuestro Equipo
          </h2>
          <p className="text-lg text-neutral/80 max-w-3xl mx-auto">
            Conoce a los profesionales que hacen posible AIQUAA, 
            comprometidos con la excelencia en testing y la innovación tecnológica.
          </p>
        </div>

        {/* Sección del Fundador */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-accent mb-2">
              Fundador y Líder
            </h3>
            <p className="text-neutral/70">
              El visionario detrás de AIQUAA
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <StevenAyala />
          </div>
        </div>

        {/* Sección de valores del equipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-neutral mb-2">
              Experiencia Comprobada
            </h4>
            <p className="text-neutral/70">
              Más de 6 años de experiencia en QA y automatización de testing
            </p>
          </div>

          <div className="text-center">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-neutral mb-2">
              Certificación ISTQB
            </h4>
            <p className="text-neutral/70">
              Certificación internacional que garantiza estándares de calidad
            </p>
          </div>

          <div className="text-center">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-neutral mb-2">
              Liderazgo de Equipos
            </h4>
            <p className="text-neutral/70">
              Capacidad para formar y dirigir equipos de testing efectivos
            </p>
          </div>
        </div>

        {/* CTA para unirse al equipo */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-8 border border-accent/20">
            <h3 className="text-2xl font-bold text-neutral mb-4">
              ¿Te gustaría ser parte de AIQUAA?
            </h3>
            <p className="text-neutral/80 mb-6 max-w-2xl mx-auto">
              Si eres un profesional apasionado por el testing y quieres contribuir 
              a nuestra comunidad, ¡nos encantaría conocerte!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-accent text-dark hover:bg-accent/90 font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contáctanos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection; 