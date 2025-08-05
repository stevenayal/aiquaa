import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const JoinSection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
          ¡Unite a <span className="text-blue-600">AIQUAA</span>!
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
          Somos una comunidad apasionada por la automatización, la inteligencia artificial y el testing de calidad. 
          Si compartís nuestra visión, queremos conocerte.
        </p>
      </div>

      {/* Misión */}
      <div className="mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Nuestra Misión</h2>
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">🚀 Innovación en Testing</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Desarrollamos y compartimos las mejores prácticas en automatización de testing, 
              integrando inteligencia artificial para crear soluciones más eficientes y precisas.
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">🤝 Comunidad Colaborativa</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Construimos una red de profesionales que comparten conocimiento, 
              experiencias y recursos para impulsar el crecimiento de la industria.
            </p>
          </div>
        </div>
      </div>

      {/* Cómo Colaborar */}
      <div className="mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">¿Cómo Podés Colaborar?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">✍️</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Escribir Artículos</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Compartí tu experiencia y conocimiento escribiendo artículos sobre automatización, 
              IA, testing o cualquier tema relacionado.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">💡</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Proponer Ideas</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Sugerí temas para artículos, herramientas para revisar, o proyectos 
              colaborativos que puedan beneficiar a la comunidad.
            </p>
          </div>
          <div className="text-center sm:col-span-2 lg:col-span-1">
            <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">🔧</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Desarrollo</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Contribuí al desarrollo de herramientas, plugins o recursos 
              que faciliten el trabajo de testing y automatización.
            </p>
          </div>
        </div>
      </div>

      {/* Cómo Postularse */}
      <div className="mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">¿Cómo Postularse?</h2>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 sm:p-8 rounded-lg">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Requisitos</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                <li>• Pasión por la automatización y testing</li>
                <li>• Experiencia en el campo (no importa el nivel)</li>
                <li>• Ganas de compartir conocimiento</li>
                <li>• Disponibilidad para colaborar</li>
                <li>• Espíritu de comunidad</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Proceso</h3>
              <ol className="space-y-2 text-sm sm:text-base text-gray-600">
                <li>1. Completá el formulario de contacto</li>
                <li>2. Contanos sobre tu experiencia</li>
                <li>3. Proponé cómo te gustaría colaborar</li>
                <li>4. Revisamos tu propuesta</li>
                <li>5. ¡Te damos la bienvenida!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          ¿Listo para ser parte de AIQUAA?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
          Unite a nuestra comunidad y ayudanos a revolucionar el mundo del testing.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Quiero ser parte
          </button>
          <Link
            to="/contact"
            className="border-2 border-blue-600 text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors text-sm sm:text-base"
          >
            Contactar
          </Link>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">¡Excelente decisión!</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Para unirte a AIQUAA, necesitamos que nos cuentes un poco sobre vos y cómo te gustaría colaborar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/contact"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                onClick={() => setShowModal(false)}
              >
                Ir al formulario
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinSection; 