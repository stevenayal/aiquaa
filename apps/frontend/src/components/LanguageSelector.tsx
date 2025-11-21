'use client';

import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const { isDarkMode } = useTheme();

  const languages: { code: Language; flag: JSX.Element; label: string }[] = [
    {
      code: 'es',
      flag: (
        <svg className="w-6 h-6" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
          <rect width="900" height="600" fill="#D52B1E"/>
          <rect y="200" width="900" height="200" fill="#FFF"/>
          <rect y="400" width="900" height="200" fill="#0038A8"/>
          <g transform="translate(450,300)">
            <circle r="60" fill="#FFE000"/>
            <path d="M 0,-50 L 10,0 L 50,-15 L 15,15 L 25,50 L 0,25 L -25,50 L -15,15 L -50,-15 L -10,0 Z" fill="#FFE000"/>
          </g>
        </svg>
      ),
      label: 'Español'
    },
    {
      code: 'en',
      flag: (
        <svg className="w-6 h-6" viewBox="0 0 7410 3900" xmlns="http://www.w3.org/2000/svg">
          <rect width="7410" height="3900" fill="#b22234"/>
          <path d="M 0,450 h 7410 m 0,600 H 0 m 0,600 h 7410 m 0,600 H 0 m 0,600 h 7410 m 0,600 H 0" stroke="#fff" strokeWidth="300"/>
          <rect width="2964" height="2100" fill="#3c3b6e"/>
          <g fill="#fff">
            {[...Array(9)].map((_, row) => [...Array(11)].map((_, col) => {
              if ((row % 2 === 0 && col % 2 === 0) || (row % 2 === 1 && col % 2 === 1)) {
                return <circle key={`${row}-${col}`} cx={247.4 * (col + 1)} cy={210 * (row + 1)} r="85"/>;
              }
              return null;
            }))}
          </g>
        </svg>
      ),
      label: 'English'
    },
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
            aria-label={`Cambiar idioma a ${lang.label}`}
          >
            <span className="flex items-center">{lang.flag}</span>
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
