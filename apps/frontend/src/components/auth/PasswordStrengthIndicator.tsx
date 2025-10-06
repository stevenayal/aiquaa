'use client';

import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const requirements: Requirement[] = [
    {
      label: 'Mínimo 8 caracteres',
      test: (pwd) => pwd.length >= 8,
      met: password.length >= 8,
    },
    {
      label: 'Una letra mayúscula',
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Una letra minúscula',
      test: (pwd) => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password),
    },
    {
      label: 'Un número',
      test: (pwd) => /\d/.test(pwd),
      met: /\d/.test(password),
    },
  ];

  const metCount = requirements.filter((req) => req.met).length;
  const strength = metCount === 0 ? 0 : (metCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200';
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    if (strength < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength === 0) return '';
    if (strength < 50) return 'Débil';
    if (strength < 75) return 'Media';
    if (strength < 100) return 'Buena';
    return 'Fuerte';
  };

  if (!password && !showRequirements) return null;

  return (
    <div className="mt-2 space-y-2">
      {password && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Fuerza de contraseña:</span>
            <span
              className={`font-medium ${
                strength === 100
                  ? 'text-green-600'
                  : strength >= 75
                  ? 'text-blue-600'
                  : strength >= 50
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {getStrengthText()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}

      {showRequirements && (
        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">Requisitos:</p>
          <ul className="space-y-1">
            {requirements.map((req, index) => (
              <li
                key={index}
                className={`text-xs flex items-center space-x-2 transition-colors ${
                  req.met ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                <svg
                  className={`w-4 h-4 ${req.met ? 'text-green-500' : 'text-gray-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {req.met ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : (
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  )}
                </svg>
                <span>{req.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
