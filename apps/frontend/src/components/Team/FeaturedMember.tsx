'use client';

const FeaturedMember = () => {
  return (
    <section className="bg-brand-light py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-4">
            👨‍💻 Conocé a Nuestro Fundador
          </h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              <img
                src="/images/logo1.png"
                alt="Steven Ayala"
                className="w-32 h-32 rounded-full object-cover border-4 border-brand-accent"
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-brand-text mb-2">
                Steven Ayala
              </h3>
              <p className="text-brand-muted mb-4">
                QA Lead & Automation Engineer
              </p>
              <p className="text-brand-text mb-4">
                Con más de 8 años de experiencia en testing y automatización, 
                Steven lidera la comunidad de QA en Paraguay. Especialista en 
                Selenium, Cypress y herramientas de testing modernas.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Selenium
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Cypress
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  API Testing
                </span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  Performance
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMember;
