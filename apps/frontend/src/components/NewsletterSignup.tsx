'use client';

import { useState } from 'react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular suscripción
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1000);
  };

  return (
    <section className="bg-brand-accent py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          📧 Mantenete Actualizado
        </h2>
        <p className="text-lg text-brand-light mb-8">
          Recibí las últimas noticias, herramientas y eventos de QA en Paraguay
        </p>
        
        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 px-4 py-3 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-white text-brand-accent px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                {isLoading ? 'Suscribiendo...' : 'Suscribirse'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white text-brand-accent px-6 py-4 rounded-lg max-w-md mx-auto">
            <p className="font-semibold">¡Gracias por suscribirte! 🎉</p>
            <p className="text-sm">Te enviaremos las últimas novedades de AIQUAA.</p>
          </div>
        )}
        
        <p className="text-sm text-brand-light mt-4">
          No spam, solo contenido útil para testers. Podés darte de baja en cualquier momento.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
