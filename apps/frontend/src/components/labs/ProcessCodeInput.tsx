'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { validateProcessCodeAction } from '@/actions/employer';

interface Props {
  value: string;
  onChange: (code: string) => void;
  onValidProcess?: (
    process: {
      code: string;
      company_name: string;
      position_name: string;
    } | null
  ) => void;
  onNormalizedCode?: (code: string) => void;
  autoValidate?: boolean;
}

export default function ProcessCodeInput({
  value,
  onChange,
  onValidProcess,
  onNormalizedCode,
  autoValidate,
}: Props) {
  const { isDarkMode } = useTheme();
  const [status, setStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >('idle');
  const [processInfo, setProcessInfo] = useState<{
    company_name: string;
    position_name: string;
  } | null>(null);

  const validate = useCallback(
    async (code: string) => {
      if (!code.trim()) {
        setStatus('idle');
        setProcessInfo(null);
        onValidProcess?.(null);
        return;
      }
      setStatus('checking');
      const { valid, process } = await validateProcessCodeAction(code);
      if (valid && process) {
        setStatus('valid');
        setProcessInfo(process);
        onValidProcess?.(process);
        onNormalizedCode?.(process.code);
      } else {
        setStatus('invalid');
        setProcessInfo(null);
        onValidProcess?.(null);
      }
    },
    [onValidProcess]
  );

  useEffect(() => {
    if (autoValidate && value.trim()) {
      validate(value);
    }
  }, [autoValidate, value, validate]);

  const inputBase = isDarkMode
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';

  const borderColor =
    status === 'valid'
      ? 'border-green-500 focus:ring-green-500'
      : status === 'invalid'
        ? 'border-red-400 focus:ring-red-400'
        : 'focus:ring-amber-500';

  return (
    <div className="space-y-2">
      <label
        className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
      >
        Código de proceso{' '}
        <span
          className={`font-normal ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
        >
          (opcional)
        </span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => validate(value)}
          placeholder="Ej: CLT-2025-ABC"
          className={`w-full px-4 py-2 rounded-lg border font-mono text-sm focus:outline-none focus:ring-2 transition-colors ${inputBase} ${borderColor}`}
        />
        {status === 'checking' && (
          <span className="absolute right-3 top-2.5">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </span>
        )}
        {status === 'valid' && (
          <span className="absolute right-3 top-2 text-green-500 text-lg">
            ✓
          </span>
        )}
        {status === 'invalid' && (
          <span className="absolute right-3 top-2 text-red-400 text-lg">✗</span>
        )}
      </div>

      {status === 'valid' && processInfo && (
        <p className="text-xs text-green-600 dark:text-green-400">
          Proceso: <strong>{processInfo.position_name}</strong> —{' '}
          {processInfo.company_name}
        </p>
      )}
      {status === 'invalid' && (
        <p className="text-xs text-red-500">
          Código inválido o proceso cerrado
        </p>
      )}
      {status === 'idle' && (
        <p
          className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
        >
          Si rendís este examen para un proceso de selección, ingresá el código
          que te enviaron
        </p>
      )}
    </div>
  );
}
