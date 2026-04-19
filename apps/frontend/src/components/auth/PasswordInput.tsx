'use client';

import React, { forwardRef, useState } from 'react';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { useTheme } from '@/contexts/ThemeContext';

interface PasswordInputProps {
  id: string;
  name: string;
  placeholder: string;
  autoComplete?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  showToggle?: boolean;
  showStrength?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      name,
      placeholder,
      autoComplete = 'current-password',
      onChange,
      className = '',
      showToggle = true,
      showStrength = false,
    },
    ref
  ) => {
    const { isDarkMode } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    // Local value only for strength indicator — never flows to parent state
    const [localValue, setLocalValue] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrength) setLocalValue(e.target.value);
      onChange?.(e);
    };

    return (
      <div>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            name={name}
            type={showPassword ? 'text' : 'password'}
            autoComplete={autoComplete}
            className={className}
            placeholder={placeholder}
            onChange={handleChange}
          />
          {showToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
        {showStrength && (
          <div className={`px-3 pb-2 border-l border-r ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-300'}`}>
            <PasswordStrengthIndicator password={localValue} />
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
