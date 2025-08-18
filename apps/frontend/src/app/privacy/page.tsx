export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-light py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            Política de Privacidad
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Cómo protegemos tu información en AIQUAA
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-brand-text mb-4">
              Tu Privacidad es Importante
            </h2>
            <p className="text-lg text-brand-text">
              AIQUAA respeta tu privacidad. Actualmente no recopilamos datos personales sensibles 
              mediante cookies ni rastreadores.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-brand-text mb-4">Datos que Recopilamos</h3>
            <p className="text-brand-text mb-3">
              Los únicos datos que podés proporcionar son voluntarios a través del formulario de contacto, 
              y serán utilizados exclusivamente para responder a tu consulta.
            </p>
            <p className="text-brand-text">
              No compartimos tus datos con terceros ni los utilizamos con fines publicitarios.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold text-brand-text mb-4">Herramientas de Labs</h3>
            <p className="text-brand-text mb-3">
              Las herramientas de Labs no almacenan información en el servidor. Todo el procesamiento 
              ocurre en tu navegador.
            </p>
            <p className="text-brand-text">
              Esto garantiza que tus datos permanezcan privados y seguros.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-brand-text mb-4">Contacto</h2>
            <p className="text-lg text-brand-text mb-4">
              Si tenés dudas sobre nuestra política de privacidad, escribinos a:
            </p>
            <a 
              href="mailto:stevenayal@proton.me"
              className="text-brand-primary hover:text-brand-primary-dark font-semibold text-lg transition-colors"
            >
              stevenayal@proton.me
            </a>
          </div>
        </div>

        <div className="bg-brand-primary/10 rounded-lg p-6 text-center">
          <p className="text-brand-text font-medium">
            Última actualización: 17 de Agosto de 2025
          </p>
        </div>
      </div>
    </div>
  );
}
