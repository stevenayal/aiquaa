import { Helmet } from 'react-helmet-async';
import ContactForm from '../components/ContactForm';

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contacto - AIQUAA</title>
        <meta name="description" content="Contáctanos para colaborar, hacer consultas o unirte a nuestra comunidad de automatización, IA y testing." />
        <meta property="og:title" content="Contacto - AIQUAA" />
        <meta property="og:description" content="Contáctanos para colaborar, hacer consultas o unirte a nuestra comunidad de automatización, IA y testing." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Contáctanos
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              ¿Tienes preguntas, sugerencias o quieres colaborar? Nos encantaría escuchar de ti.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Envíanos un Mensaje
              </h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Información de Contacto
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Correo Electrónico
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        <a href="mailto:stevenayal@proton.me" className="hover:text-blue-600 dark:hover:text-blue-400">
                          stevenayal@proton.me
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Ubicación
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Capiatá, Paraguay<br />
                        Remoto disponible
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Horario de Atención
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Lunes - Viernes: 9:00 - 18:00<br />
                        Respuesta en 24-48 horas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Síguenos
                </h2>
                <div className="flex space-x-4">
                  <a
                    href="https://x.com/stevenayaal"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sígueme en Twitter (X)"
                    className="bg-blue-400 hover:bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/stevenayal/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Conecta conmigo en LinkedIn"
                    className="bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a
                    href="https://github.com/stevenayal"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visita mi perfil en GitHub"
                    className="bg-gray-800 hover:bg-gray-900 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Preguntas Frecuentes
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      ¿Puedo colaborar con artículos?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      ¡Por supuesto! Nos encanta recibir contribuciones de la comunidad. Envíanos un mensaje con tu propuesta.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      ¿Ofrecen servicios de consultoría?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Sí, ofrecemos servicios de consultoría en testing y QA. Contáctanos para discutir tus necesidades.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      ¿Cómo puedo mantenerme actualizado?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Síguenos en redes sociales y suscríbete a nuestro newsletter para recibir las últimas novedades.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact; 