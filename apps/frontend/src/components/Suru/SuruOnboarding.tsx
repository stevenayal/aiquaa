'use client';

import { useState, useEffect } from 'react';
import SuruMascot from './SuruMascot';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnboardingStep {
  pose: 'welcome' | 'explaining' | 'teacher' | 'success';
  messageKey: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface SuruOnboardingProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export default function SuruOnboarding({
  onComplete,
  autoStart = true,
}: SuruOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { t } = useLanguage();

  // Check if user has completed onboarding before
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('suru-onboarding-completed');
    if (hasCompletedOnboarding) {
      setIsCompleted(true);
      return;
    }

    if (autoStart) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  const steps: OnboardingStep[] = [
    {
      pose: 'welcome',
      messageKey: 'suru.onboarding.welcome',
      action: {
        label: t('suru.onboarding.next'),
        onClick: () => nextStep(),
      },
    },
    {
      pose: 'explaining',
      messageKey: 'suru.onboarding.explore',
      action: {
        label: t('suru.onboarding.next'),
        onClick: () => nextStep(),
      },
    },
    {
      pose: 'teacher',
      messageKey: 'suru.onboarding.learn',
      action: {
        label: t('suru.onboarding.next'),
        onClick: () => nextStep(),
      },
    },
    {
      pose: 'success',
      messageKey: 'suru.onboarding.ready',
      action: {
        label: t('suru.onboarding.start'),
        onClick: () => completeOnboarding(),
      },
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('suru-onboarding-completed', 'true');
    setIsCompleted(true);
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('suru-onboarding-completed', 'true');
    setIsVisible(false);
  };

  if (isCompleted || !isVisible) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-2xl mx-4">
        {/* Suru Mascot */}
        <div className="flex justify-center mb-8">
          <SuruMascot pose={currentStepData.pose} size="large" animated />
        </div>

        {/* Message Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border-4 border-cyan-500">
          <div className="text-center mb-6">
            <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-4">
              {t(currentStepData.messageKey)}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-cyan-500 w-8'
                      : index < currentStep
                      ? 'bg-cyan-300'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  aria-label={`Ir al paso ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-4">
            {/* Skip button */}
            <button
              onClick={skipOnboarding}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold transition-colors"
            >
              {t('suru.onboarding.skip')}
            </button>

            <div className="flex gap-3">
              {/* Previous button */}
              {currentStep > 0 && (
                <button
                  onClick={previousStep}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  {t('suru.onboarding.previous')}
                </button>
              )}

              {/* Next/Complete button */}
              {currentStepData.action && (
                <button
                  onClick={currentStepData.action.onClick}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {currentStepData.action.label}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}
