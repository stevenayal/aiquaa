'use client';

import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const { isDarkMode } = useTheme();

  const languages: { code: Language; flag: string; label: string }[] = [
    { code: 'es', flag: '🇵🇾', label: 'Español' },
    { code: 'en', flag: '🇺🇸', label: 'English' },
  ];

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
              ${
                language === lang.code
                  ? isDarkMode
                    ? 'bg-amber-900/30 border-2 border-amber-500'
                    : 'bg-amber-100 border-2 border-amber-500'
                  : isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                    : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
              }
            `}
            title={lang.label}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span
              className={`text-sm font-medium ${
                language === lang.code
                  ? isDarkMode
                    ? 'text-amber-400'
                    : 'text-amber-700'
                  : isDarkMode
                    ? 'text-slate-300'
                    : 'text-gray-700'
              }`}
            >
              {lang.code.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
