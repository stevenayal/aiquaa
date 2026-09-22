'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Partner {
  id: string;
  name: string;
  url: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
}

const PARTNERS: Partner[] = [
  {
    id: 'cit-una',
    name: 'CIT - Centro de Innovación TIC (UNA)',
    url: 'https://cit.pol.una.py/',
    logo: '/images/partners/cit.png',
    logoWidth: 257,
    logoHeight: 257,
  },
  {
    id: 'clt-sa',
    name: 'CLT S.A.',
    url: 'https://www.clt.com.py/',
    logo: '/images/partners/clt.png',
    logoWidth: 677,
    logoHeight: 177,
  },
];

export default function PartnersSection() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  return (
    <div
      className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}
    >
      <h2
        className={`text-3xl font-bold mb-3 text-center ${
          isDarkMode ? 'text-white' : 'text-brand-text'
        }`}
      >
        {t('about.partners.title')}
      </h2>
      <p
        className={`text-lg text-center max-w-2xl mx-auto mb-10 ${
          isDarkMode ? 'text-slate-300' : 'text-brand-muted'
        }`}
      >
        {t('about.partners.subtitle')}
      </p>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {PARTNERS.map((partner) => (
          <a
            key={partner.id}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-4 p-6 rounded-lg border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 hover:border-slate-500'
                : 'bg-brand-light border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className={`flex items-center justify-center h-20 w-full rounded-md p-2 ${
                isDarkMode ? 'bg-white' : 'bg-white'
              }`}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={partner.logoWidth}
                height={partner.logoHeight}
                className="max-h-16 w-auto object-contain"
              />
            </div>
            <span
              className={`text-sm font-semibold text-center ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}
            >
              {partner.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
