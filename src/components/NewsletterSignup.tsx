import React, { useState } from 'react';

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Por favor ingresa tu correo electrónico');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Por favor ingresa un correo electrónico válido');
      return;
    }

    setStatus('loading');
    
    try {
      // Simular envío - aquí se conectaría con Mailchimp o similar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setMessage('¡Gracias por suscribirte! Te enviaremos contenido exclusivo.');
      setEmail('');
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
      
    } catch (error) {
      setStatus('error');
      setMessage('Hubo un error al suscribirte. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
          ¡Mantente actualizado con AIQUAA!
        </h3>
        <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 opacity-90">
          Recibe artículos exclusivos, recursos y las últimas novedades sobre automatización, IA y testing.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresá tu correo para recibir artículos y recursos"
            className="flex-1 px-3 sm:px-4 py-3 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 sm:px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {status === 'loading' ? 'Enviando...' : 'Suscribirse'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-3 sm:mt-4 p-3 rounded-lg text-sm sm:text-base ${
            status === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterSignup; 