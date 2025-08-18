export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-light py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Condiciones de uso de AIQUAA y sus herramientas
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-brand-text mb-4">
              Uso del Sitio
            </h2>
            <p className="text-lg text-brand-text">
              Al utilizar el sitio web aiquaa.com y sus herramientas (como los validadores, 
              generadores o decodificadores), aceptás que lo hacés bajo tu propio criterio.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-brand-text mb-4">Responsabilidad</h3>
            <p className="text-brand-text mb-3">
              AIQUAA no se responsabiliza por daños, pérdidas o decisiones derivadas del uso 
              de las herramientas. Son ofrecidas de forma gratuita, con fines educativos y 
              de apoyo a la comunidad QA.
            </p>
            <p className="text-brand-text">
              Es tu responsabilidad verificar la precisión y adecuación de los resultados 
              obtenidos con nuestras herramientas.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-brand-text mb-4">Cambios en el Contenido</h3>
            <p className="text-brand-text mb-3">
              El contenido del sitio puede cambiar sin previo aviso. Nos reservamos el derecho 
              de modificar, actualizar o eliminar cualquier contenido según sea necesario.
            </p>
            <p className="text-brand-text">
              Te recomendamos revisar periódicamente esta página para estar al tanto de 
              cualquier cambio.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">©️</div>
            <h3 className="text-xl font-bold text-brand-text mb-4">Propiedad Intelectual</h3>
            <p className="text-brand-text mb-3">
              Todo el material, salvo que se indique lo contrario, es propiedad de AIQUAA. 
              El contenido está protegido por las leyes de propiedad intelectual aplicables.
            </p>
            <p className="text-brand-text">
              El contenido está licenciado bajo Creative Commons CC BY-NC-SA 4.0, 
              permitiendo uso no comercial con atribución.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-brand-text mb-4">Uso Aceptable</h3>
            <p className="text-brand-text mb-3">
              Te comprometés a utilizar el sitio y las herramientas de manera responsable 
              y ética. No está permitido el uso malicioso o que pueda dañar a otros 
              usuarios o sistemas.
            </p>
            <p className="text-brand-text">
              El uso debe ser para fines legítimos de testing, desarrollo y aprendizaje.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-brand-text mb-4">Contacto</h2>
            <p className="text-lg text-brand-text mb-4">
              Si tenés dudas sobre nuestros términos y condiciones, escribinos a:
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
            Última actualización: Agosto 2025
          </p>
        </div>
      </div>
    </div>
  );
}
