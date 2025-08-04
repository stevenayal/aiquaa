import { Helmet } from 'react-helmet-async';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Política de Privacidad - AIQUAA</title>
        <meta name="description" content="Política de privacidad de AIQUAA. Conoce cómo protegemos tu información personal y qué datos recopilamos." />
        <meta property="og:title" content="Política de Privacidad - AIQUAA" />
        <meta property="og:description" content="Política de privacidad de AIQUAA. Conoce cómo protegemos tu información personal y qué datos recopilamos." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Política de Privacidad
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Cómo protegemos tu información en AIQUAA
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                <strong>AIQUAA respeta tu privacidad.</strong> Actualmente no recopilamos datos personales sensibles mediante cookies ni rastreadores.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
                Datos que recopilamos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Los únicos datos que podés proporcionar son voluntarios a través del formulario de contacto, y serán utilizados exclusivamente para responder a tu consulta. No compartimos tus datos con terceros ni los utilizamos con fines publicitarios.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
                Herramientas de Labs
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Las herramientas de Labs no almacenan información en el servidor. Todo el procesamiento ocurre en tu navegador, garantizando que tus datos permanezcan privados y seguros.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
                Contacto
              </h2>
                             <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                 Si tenés dudas sobre nuestra política de privacidad, escribinos a{' '}
                 <a 
                   href="mailto:stevenayal@proton.me" 
                   className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                 >
                   stevenayal@proton.me
                 </a>
               </p>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Última actualización:</strong> Diciembre 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy; 