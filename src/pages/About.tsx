const About = () => {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Acerca de AIQUAA
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tu fuente confiable de conocimiento sobre testing de software y QA
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Nuestra Misión
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              En AIQUAA, creemos que la calidad del software es fundamental para el éxito de cualquier proyecto tecnológico. 
              Nuestra misión es compartir conocimientos, experiencias y mejores prácticas en el campo del testing de software 
              y aseguramiento de calidad.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              A través de nuestro blog, buscamos crear una comunidad de profesionales de QA que puedan aprender, 
              crecer y contribuir al desarrollo de software de alta calidad. Creemos en el poder del conocimiento 
              compartido y en la importancia de mantenernos actualizados con las últimas tendencias y herramientas 
              del mercado.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Nuestra Visión
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Democratizar el conocimiento sobre testing e impulsar la calidad del software en Paraguay y Latinoamérica.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Nuestros Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ética
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Actuamos con integridad y transparencia en todas nuestras acciones
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Comunidad
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Fomentamos la colaboración y el intercambio de conocimientos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Transparencia
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Compartimos abiertamente nuestros conocimientos y experiencias
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Profesionalismo
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Mantenemos los más altos estándares de calidad y excelencia
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Innovación
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Exploramos nuevas tecnologías y metodologías de testing
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Nuestro Equipo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">MG</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    María González
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    QA Lead & Automation Specialist
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Especialista en automatización de testing con más de 8 años de experiencia en Selenium, 
                Appium y frameworks de testing. Apasionada por compartir conocimientos y mejores prácticas.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">CR</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Carlos Rodríguez
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Performance Testing Expert
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Experto en testing de rendimiento y seguridad con amplia experiencia en JMeter, 
                LoadRunner y herramientas de testing de seguridad. Instructor certificado en múltiples tecnologías.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">AM</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Ana Martínez
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    API Testing Specialist
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Especialista en testing de APIs y microservicios. Experta en Postman, REST Assured 
                y testing de integración. Contribuye activamente a la comunidad de testing.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">LF</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Luis Fernández
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Security Testing Expert
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Experto en testing de seguridad y compliance. Certificado en OWASP y especialista 
                en identificación de vulnerabilidades y mejores prácticas de seguridad.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            ¿Tienes preguntas o quieres colaborar?
          </h2>
          <p className="text-blue-100 mb-6">
            Nos encantaría escuchar de ti. Contáctanos para discutir proyectos, 
            colaboraciones o simplemente para compartir ideas.
          </p>
          <a
            href="/contact"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Contáctanos
          </a>
        </section>
      </div>
    </div>
  );
};

export default About; 