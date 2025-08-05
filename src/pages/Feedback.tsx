import { Helmet } from 'react-helmet-async';
import FeedbackForm from '../components/FeedbackForm';

const Feedback: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Feedback - Aiquaa</title>
        <meta name="description" content="Ayudanos a construir Aiquaa. Comparte tu feedback sobre temas de QA, herramientas y formatos de contenido que te interesan." />
        <meta name="keywords" content="feedback, QA, testing, automatización, herramientas, Paraguay" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🎯 Construyamos Aiquaa Juntos
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Tu opinión es fundamental para crear la mejor comunidad de QA en Paraguay. 
              Queremos saber qué te interesa y cómo podemos ayudarte a crecer profesionalmente.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">🎯</div>
              <h3 className="font-semibold text-gray-800 mb-2">Objetivo Claro</h3>
              <p className="text-sm text-gray-600">
                Entender qué necesitas para tu crecimiento en QA
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">📊</div>
              <h3 className="font-semibold text-gray-800 mb-2">Datos Medibles</h3>
              <p className="text-sm text-gray-600">
                Feedback estructurado para tomar mejores decisiones
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">🚀</div>
              <h3 className="font-semibold text-gray-800 mb-2">Acción Inmediata</h3>
              <p className="text-sm text-gray-600">
                Usaremos tu feedback para crear contenido relevante
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <FeedbackForm />
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3">¿Por qué es importante tu feedback?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="text-left">
                  <p className="mb-2">✅ <strong>Contenido relevante:</strong> Crearemos lo que realmente necesitas</p>
                  <p className="mb-2">✅ <strong>Comunidad activa:</strong> Conectaremos testers con intereses similares</p>
                </div>
                <div className="text-left">
                  <p className="mb-2">✅ <strong>Recursos útiles:</strong> Herramientas y plantillas que uses</p>
                  <p className="mb-2">✅ <strong>Crecimiento local:</strong> Fortalecer el ecosistema QA en Paraguay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Feedback; 