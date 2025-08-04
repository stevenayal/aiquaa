import stevenData from '../../data/team/steven-ayala.json';

const FeaturedMember = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-primary via-primary to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral mb-4">
            Conoce al Fundador
          </h2>
          <p className="text-lg text-neutral/80 max-w-3xl mx-auto">
            El profesional detrás de AIQUAA, comprometido con la excelencia en testing y la innovación tecnológica
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-2xl shadow-2xl overflow-hidden border border-accent/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Columna izquierda - Información principal */}
              <div className="lg:col-span-2 p-8 lg:p-12">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-neutral mb-2">{stevenData.name}</h3>
                  <p className="text-xl text-accent font-semibold mb-1">{stevenData.role}</p>
                  <p className="text-neutral/80 mb-3">{stevenData.company}</p>
                  <div className="flex items-center text-neutral/70">
                    <svg className="w-4 h-4 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{stevenData.location}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-neutral/90 leading-relaxed text-lg">
                    {stevenData.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-neutral mb-3 flex items-center">
                    <svg className="w-5 h-5 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Habilidades Principales
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stevenData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-accent/15 text-accent px-3 py-2 rounded-lg text-sm font-medium border border-accent/25 hover:bg-accent/25 transition-colors duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={stevenData.profileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-accent text-dark hover:bg-accent/90 font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Ver LinkedIn
                  </a>
                  <a
                    href="/labs"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-neutral text-neutral hover:bg-neutral hover:text-primary font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Ver Herramientas
                  </a>
                </div>
              </div>

              {/* Columna derecha - Avatar y estadísticas */}
              <div className="bg-gradient-to-b from-accent/20 to-accent/10 p-8 lg:p-12 flex flex-col items-center justify-center">
                <div className="text-center">
                  {/* Avatar grande */}
                  <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center shadow-2xl mb-6 mx-auto">
                    <span className="text-dark font-bold text-4xl">SA</span>
                  </div>
                  
                  {/* Estadísticas */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral">6+</div>
                      <div className="text-sm text-neutral/70">Años de Experiencia</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral">ISTQB</div>
                      <div className="text-sm text-neutral/70">Certificado</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral">AIQUAA</div>
                      <div className="text-sm text-neutral/70">Fundador</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMember; 