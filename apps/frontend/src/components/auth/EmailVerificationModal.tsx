'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface EmailVerificationModalProps {
  email: string;
  onClose: () => void;
  onResend: () => Promise<void>;
  /** 'post-register' = just signed up; 'login-blocked' = tried to login unverified */
  context?: 'post-register' | 'login-blocked';
}

export default function EmailVerificationModal({
  email,
  onClose,
  onResend,
  context = 'post-register',
}: EmailVerificationModalProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'ok' | 'error' | 'cooldown'>('idle');
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (cooldownSecs <= 0) return;
    const t = setTimeout(() => setCooldownSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownSecs]);

  const handleResend = async () => {
    if (cooldownSecs > 0 || isResending) return;
    setIsResending(true);
    setResendStatus('idle');
    try {
      await onResend();
      setResendStatus('ok');
      setCooldownSecs(60);
    } catch {
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const title =
    context === 'post-register'
      ? '¡Registro exitoso! Verificá tu correo'
      : 'Verificá tu correo para continuar';

  const body =
    context === 'post-register'
      ? 'Te enviamos un enlace de confirmación a'
      : 'Tu cuenta aún no fue verificada. Revisá el correo que te enviamos a';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-verify-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center gap-5">
          {/* Close */}
          <button
            ref={closeRef}
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="text-center">
            <h2
              id="email-verify-title"
              className="text-xl font-bold text-gray-900 dark:text-white mb-2"
            >
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {body}{' '}
              <span className="font-semibold text-gray-900 dark:text-white break-all">
                {email}
              </span>
              . Hacé clic en el enlace del correo para activar tu cuenta.
            </p>
          </div>

          {/* Steps */}
          <ol className="w-full text-sm text-gray-600 dark:text-gray-400 space-y-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 list-none">
            {[
              'Abrí tu bandeja de entrada',
              'Buscá un correo de AIQUAA',
              'Hacé clic en "Confirmar cuenta"',
              'Volvé aquí e iniciá sesión',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {/* Resend feedback */}
          {resendStatus === 'ok' && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Correo reenviado. Revisá tu bandeja de entrada.
            </p>
          )}
          {resendStatus === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              No se pudo reenviar. Intentá en unos minutos.
            </p>
          )}

          {/* Resend button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldownSecs > 0}
            className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Reenviando...
              </>
            ) : cooldownSecs > 0 ? (
              `Reenviar en ${cooldownSecs}s`
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reenviar correo de confirmación
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            ¿Ya confirmaste tu cuenta?{' '}
            <Link
              href="/login"
              onClick={onClose}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
