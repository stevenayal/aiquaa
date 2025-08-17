export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-light py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            Acerca de AIQUAA
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Saber es Calidad. Inspirados por el conocimiento, impulsados por la comunidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-brand-text mb-6">
              ¿Qué es AIQUAA?
            </h2>
            <p className="text-lg text-brand-text mb-4">
              AIQUAA es una iniciativa paraguaya que fusiona conocimiento local con innovación global 
              en testing de software. Inspirada en el término guaraní &ldquo;aikuaa&rdquo; —que significa 
              saber o conocer—, nuestra misión es construir una comunidad comprometida con la calidad, 
              la capacitación constante y la excelencia profesional.
            </p>
            <p className="text-lg text-brand-text">
              Combinamos inteligencia artificial (AI) con aseguramiento de calidad (QA) para transformar 
              el testing en Paraguay y en la región.
            </p>
          </div>
          <div className="text-center">
            <img
              src="/images/logo1.png"
              alt="AIQUAA Logo"
              className="w-64 h-64 mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-brand-text mb-3">Misión</h3>
            <p className="text-brand-muted">
              Construir la comunidad de QA más fuerte de Paraguay, brindando herramientas, 
              recursos y capacitación de calidad.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-xl font-bold text-brand-text mb-3">Visión</h3>
            <p className="text-brand-muted">
              Ser el referente en testing y calidad de software en Paraguay, 
              impulsando la innovación y el desarrollo profesional.
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-brand-text mb-3">Valores</h3>
            <p className="text-brand-muted">
              Calidad, innovación, comunidad, aprendizaje continuo y excelencia 
              en todo lo que hacemos.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-brand-text mb-6 text-center">
            Nuestras Herramientas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔍</div>
              <h4 className="font-semibold text-brand-text">Validador JSON</h4>
              <p className="text-sm text-brand-muted">Valida y formatea JSON</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-brand-text">Generador de Datos</h4>
              <p className="text-sm text-brand-muted">Crea datos de prueba</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">✅</div>
              <h4 className="font-semibold text-brand-text">Checklist</h4>
              <p className="text-sm text-brand-muted">Listas de verificación</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔐</div>
              <h4 className="font-semibold text-brand-text">Decodificador JWT</h4>
              <p className="text-sm text-brand-muted">Analiza tokens JWT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
