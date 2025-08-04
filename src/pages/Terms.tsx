import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Términos y Condiciones - AIQUAA</title>
        <meta name="description" content="Términos y condiciones de uso de AIQUAA. Conoce las condiciones para utilizar nuestro sitio web y herramientas." />
        <meta property="og:title" content="Términos y Condiciones - AIQUAA" />
        <meta property="og:description" content="Términos y condiciones de uso de AIQUAA. Conoce las condiciones para utilizar nuestro sitio web y herramientas." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Condiciones de uso de AIQUAA y sus herramientas
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Al utilizar el sitio web aiquaa.com y sus herramientas (como los validadores, generadores o decodificadores), aceptás que lo hacés bajo tu propio criterio.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
                Responsabilidad
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                AIQUAA no se responsabiliza por daños, pérdidas o decisiones derivadas del uso de las herramientas. Son ofrecidas de forma gratuita, con fines educativos y de apoyo a la comunidad QA.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
                Cambios en el contenido
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                El contenido del sitio puede cambiar sin previo aviso. Nos reservamos el derecho de modificar, actualizar o eliminar cualquier contenido según sea necesario.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
                Propiedad intelectual
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Todo el material, salvo que se indique lo contrario, es propiedad de AIQUAA. El contenido está protegido por las leyes de propiedad intelectual aplicables.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
                Uso aceptable
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Te comprometés a utilizar el sitio y las herramientas de manera responsable y ética. No está permitido el uso malicioso o que pueda dañar a otros usuarios o sistemas.
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

export default Terms; 