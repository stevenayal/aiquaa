'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface FAQItem {
  questionKey: string;
  answerKey: string;
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  const faqs: FAQItem[] = [
    { questionKey: 'home.faq.q1', answerKey: 'home.faq.a1' },
    { questionKey: 'home.faq.q2', answerKey: 'home.faq.a2' },
    { questionKey: 'home.faq.q3', answerKey: 'home.faq.a3' },
    { questionKey: 'home.faq.q4', answerKey: 'home.faq.a4' },
    { questionKey: 'home.faq.q5', answerKey: 'home.faq.a5' },
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
            ❓ {t('home.faq.title')}
          </h2>
          <p className={isDarkMode ? 'text-slate-300' : 'text-brand-muted'}>
            {t('home.faq.subtitle')}
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
                  {t(faq.questionKey)}
                </span>
                <span className={isDarkMode ? 'text-blue-400' : 'text-brand-accent'}>
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className={isDarkMode ? 'text-slate-300' : 'text-brand-muted'}>
                    {t(faq.answerKey)}
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
