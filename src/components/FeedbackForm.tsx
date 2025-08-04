import React, { useState } from 'react';
import { feedbackService, type FeedbackData } from '../services/feedbackService';

const FeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackData>({
    id: '',
    nombre: '',
    temasQA: [],
    herramientas: [],
    participacion: '',
    formato: '',
    sugerencias: '',
    fecha: '',
    sessionId: '',
    userAgent: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const temasQAOptions = [
    { value: 'automatizacion', label: 'Automatización' },
    { value: 'manual', label: 'Pruebas Manuales' },
    { value: 'api', label: 'API Testing' },
    { value: 'performance', label: 'Performance' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'paraguay', label: 'Casos reales Paraguay' }
  ];

  const herramientasOptions = [
    { value: 'postman', label: 'Postman' },
    { value: 'cypress', label: 'Cypress' },
    { value: 'selenium', label: 'Selenium' },
    { value: 'playwright', label: 'Playwright' },
    { value: 'jmeter', label: 'JMeter' },
    { value: 'gh-actions', label: 'GitHub Actions' }
  ];

  const participacionOptions = [
    { value: 'taller', label: 'Talleres gratuitos' },
    { value: 'charlas', label: 'Charlas en vivo' },
    { value: 'discord', label: 'Grupo de Discord/Telegram' },
    { value: 'articulos', label: 'Escribir artículos' },
    { value: 'red', label: 'Red de testers Py' }
  ];

  const formatoOptions = [
    { value: 'videos', label: 'Videos cortos' },
    { value: 'blog', label: 'Artículos' },
    { value: 'infografias', label: 'Infografías' },
    { value: 'plantillas', label: 'Plantillas descargables' }
  ];

  const handleCheckboxChange = (field: 'temasQA' | 'herramientas', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.temasQA.length === 0) {
      newErrors.temasQA = 'Selecciona al menos un tema de QA';
    }

    if (formData.herramientas.length === 0) {
      newErrors.herramientas = 'Selecciona al menos una herramienta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Submit feedback using the service
      await feedbackService.submitFeedback({
        nombre: formData.nombre,
        temasQA: formData.temasQA,
        herramientas: formData.herramientas,
        participacion: formData.participacion,
        formato: formData.formato,
        sugerencias: formData.sugerencias,
        userAgent: navigator.userAgent
      });

      setIsSubmitted(true);
      
      // Reset form after successful submission
      setFormData({
        id: '',
        nombre: '',
        temasQA: [],
        herramientas: [],
        participacion: '',
        formato: '',
        sugerencias: '',
        fecha: '',
        sessionId: '',
        userAgent: ''
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrors({ submit: 'Error al enviar el formulario. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">¡Gracias por colaborar con Aiquaa!</h2>
        <p className="text-gray-600 mb-4">
          Tu feedback es invaluable para construir la mejor comunidad de QA en Paraguay.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Te mantendremos informado sobre las novedades y contenido que más te interesa.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition-all"
        >
          Enviar otro feedback
        </button>
      </div>
    );
  }

  return (
    <form 
      id="form-feedback-qa" 
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">🎯 ¡Ayudanos a construir Aiquaa!</h2>
        <p className="text-gray-600 mt-2">
          Queremos saber qué temas, herramientas y formatos te interesan.
        </p>
      </div>

      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="block font-semibold text-gray-700 mb-2">
          Tu nombre (opcional)
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="¿Cómo te llamas?"
        />
      </div>

      {/* Temas QA */}
      <div>
        <label className="block font-semibold text-gray-700 mb-2">
          ¿Qué temas de QA te interesan? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {temasQAOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="temasQA"
                value={option.value}
                checked={formData.temasQA.includes(option.value)}
                onChange={() => handleCheckboxChange('temasQA', option.value)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.temasQA && (
          <p className="text-red-500 text-sm mt-1">{errors.temasQA}</p>
        )}
        <input
          type="text"
          name="otros-temas"
          placeholder="Otros temas..."
          className="w-full border border-gray-300 rounded-lg p-3 mt-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Herramientas */}
      <div>
        <label className="block font-semibold text-gray-700 mb-2">
          ¿Qué herramientas te interesan? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {herramientasOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="herramientas"
                value={option.value}
                checked={formData.herramientas.includes(option.value)}
                onChange={() => handleCheckboxChange('herramientas', option.value)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.herramientas && (
          <p className="text-red-500 text-sm mt-1">{errors.herramientas}</p>
        )}
        <input
          type="text"
          name="otras-herramientas"
          placeholder="Otras herramientas..."
          className="w-full border border-gray-300 rounded-lg p-3 mt-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Participación */}
      <div>
        <label htmlFor="participacion" className="block font-semibold text-gray-700 mb-2">
          ¿En qué te gustaría participar?
        </label>
        <select
          name="participacion"
          id="participacion"
          value={formData.participacion}
          onChange={(e) => handleInputChange('participacion', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Seleccioná una opción</option>
          {participacionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Formato */}
      <div>
        <label htmlFor="formato" className="block font-semibold text-gray-700 mb-2">
          ¿Qué formato de contenido preferís?
        </label>
        <select
          name="formato"
          id="formato"
          value={formData.formato}
          onChange={(e) => handleInputChange('formato', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Seleccioná uno</option>
          {formatoOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sugerencias */}
      <div>
        <label htmlFor="sugerencias" className="block font-semibold text-gray-700 mb-2">
          ¿Alguna idea loca o sugerencia? 🚀
        </label>
        <textarea
          name="sugerencias"
          id="sugerencias"
          rows={4}
          value={formData.sugerencias}
          onChange={(e) => handleInputChange('sugerencias', e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Queremos escucharte..."
        />
      </div>

      {/* Error message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-6 rounded-xl w-full transition-all duration-200 transform hover:scale-105 disabled:transform-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando...
          </span>
        ) : (
          'Enviar respuesta ✅'
        )}
      </button>
    </form>
  );
};

export default FeedbackForm; 