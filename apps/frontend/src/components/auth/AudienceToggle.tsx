'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export type Audience = 'candidato' | 'empresa';

interface AudienceToggleProps {
  value: Audience;
  onChange: (v: Audience) => void;
}

export default function AudienceToggle({ value, onChange }: AudienceToggleProps) {
  const { isDarkMode } = useTheme();

  const options: Array<{ key: Audience; label: string; sub: string; emoji: string }> = [
    { key: 'candidato', label: 'Candidato',  sub: 'Quiero practicar y certificarme', emoji: '🎓' },
    { key: 'empresa',   label: 'Empresa',    sub: 'Quiero contratar talento QA',     emoji: '🏢' },
  ];

  return (
    <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl mb-6 ${
      isDarkMode ? 'bg-slate-700/50 border border-slate-600/60' : 'bg-gray-100 border border-gray-200'
    }`}>
      {options.map(opt => {
        const selected = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`flex flex-col items-start text-left px-4 py-3 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              selected
                ? isDarkMode
                  ? 'bg-slate-900 shadow-md text-white'
                  : 'bg-white shadow-md text-gray-900'
                : isDarkMode
                  ? 'text-slate-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span>{opt.emoji}</span>
              {opt.label}
            </span>
            <span className={`text-[11px] mt-0.5 leading-tight ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              {opt.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
