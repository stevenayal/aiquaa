import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setMessage('Por favor ingresa tu nombre');
      return false;
    }
    
    if (!formData.email.trim()) {
      setMessage('Por favor ingresa tu correo electrónico');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Por favor ingresa un correo electrónico válido');
      return false;
    }

    if (!formData.mensaje.trim()) {
      setMessage('Por favor ingresa tu mensaje');
      return false;
    }

    if (formData.mensaje.length < 10) {
      setMessage('El mensaje debe tener al menos 10 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    
    try {
      // Simular envío - preparado para integración con Formspree, Getform o similar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('success');
      setMessage('¡Mensaje enviado con éxito! Te responderemos pronto. (Formulario en modo demo - próximamente conectado a backend)');
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        mensaje: ''
      });
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
      
    } catch (error) {
      setStatus('error');
      setMessage('Hubo un error al enviar el mensaje. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Tu nombre completo"
            disabled={status === 'loading'}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="tu@email.com"
            disabled={status === 'loading'}
          />
        </div>

        <div>
          <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje *
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-sm sm:text-base"
            placeholder="Cuéntanos sobre tu proyecto, consulta o cómo podemos ayudarte..."
            disabled={status === 'loading'}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
        </button>

        {message && (
          <div className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
            status === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactForm; 