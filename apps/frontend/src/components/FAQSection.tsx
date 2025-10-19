'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { isDarkMode } = useTheme();

  const faqs: FAQItem[] = [
    {
      question: "¿Qué es AIQUAA?",
      answer: "AIQUAA es una comunidad de testing y calidad de software en Paraguay. Brindamos recursos, herramientas gratuitas, mentorías y eventos para testers funcionales, automatizadores y QA manual."
    },
    {
      question: "¿Las herramientas son realmente gratuitas?",
      answer: "Sí, todas nuestras herramientas son 100% gratuitas. No hay costos ocultos ni limitaciones. Creemos en democratizar el acceso a herramientas de calidad para la comunidad de QA."
    },
    {
      question: "¿Puedo contribuir al proyecto?",
      answer: "¡Absolutamente! AIQUAA es un proyecto de código abierto. Podés contribuir reportando bugs, sugiriendo nuevas funcionalidades, o enviando pull requests en nuestro repositorio de GitHub."
    },
    {
      question: "¿Ofrecen capacitaciones o mentorías?",
      answer: "Sí, organizamos eventos, workshops y mentorías tanto presenciales como virtuales. Seguinos en nuestras redes sociales para estar al tanto de las próximas actividades."
    },
    {
      question: "¿Las herramientas funcionan en móviles?",
      answer: "Todas nuestras herramientas están optimizadas para funcionar en dispositivos móviles, tablets y desktop. La experiencia es responsive y se adapta a cualquier pantalla."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            ❓ Preguntas Frecuentes
          </h2>
          <p className={isDarkMode ? 'text-slate-300' : 'text-brand-muted'}>
            Resolvemos las dudas más comunes sobre AIQUAA
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-lg shadow-md overflow-hidden transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full px-6 py-4 text-left flex justify-between items-center transition ${
                  isDarkMode
                    ? 'hover:bg-slate-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}>
                  {faq.question}
                </span>
                <span className={isDarkMode ? 'text-blue-400' : 'text-brand-accent'}>
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className={isDarkMode ? 'text-slate-300' : 'text-brand-muted'}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
