'use client';

import { useState, useEffect } from 'react';
import SuruMascot, { type SuruPose } from './SuruMascot';
import { useLanguage } from '@/contexts/LanguageContext';

interface SuruFloatingProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnPages?: string[]; // Array of page paths where Suru should appear
  hideOnPages?: string[]; // Array of page paths where Suru should NOT appear
  initialMessage?: string;
  pose?: SuruPose;
}

export default function SuruFloating({
  position = 'bottom-right',
  showOnPages,
  hideOnPages,
  initialMessage,
  pose = 'welcome',
}: SuruFloatingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | undefined>(
    initialMessage
  );
  const { t } = useLanguage();

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-20 right-6',
    'top-left': 'top-20 left-6',
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    };

    // Check on mount
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if Suru should be visible on this page
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname;

    // Check if page is in hideOnPages
    if (hideOnPages && hideOnPages.some((page) => currentPath.includes(page))) {
      setIsVisible(false);
      return;
    }

    // Check if page is in showOnPages (if specified)
    if (showOnPages && !showOnPages.some((page) => currentPath.includes(page))) {
      setIsVisible(false);
      return;
    }

    // Show Suru after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showOnPages, hideOnPages]);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    if (!isVisible) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Hide when scrolling down significantly
          if (currentScrollY > lastScrollY + 100 && currentScrollY > 200) {
            setIsMinimized(true);
          }

          // Show when scrolling up
          if (currentScrollY < lastScrollY - 50) {
            setIsMinimized(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible]);

  const handleInteraction = () => {
    // Cycle through different messages including motivational phrases
    const messages = [
      t('suru.intro'),
      t('suru.motivation.basicoite'),
      t('suru.motivation.afallapa'),
      t('suru.motivation.competition'),
      t('suru.motivation.discipline'),
      t('suru.motivation.growth'),
      t('suru.motivation.community'),
      t('suru.tooltip.labs'),
      t('suru.tooltip.istqb'),
      t('suru.tooltip.community'),
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCurrentMessage(randomMessage);

    // Clear message after 7 seconds (longer for motivational phrases)
    setTimeout(() => {
      setCurrentMessage(undefined);
    }, 7000);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Store in localStorage that user closed Suru
    localStorage.setItem('suru-floating-closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed ${positionClasses[position]} z-40 transition-all duration-500 ${
        isMinimized ? 'scale-75 opacity-50' : 'scale-100 opacity-100'
      }`}
    >
      {/* Close button - Bigger size - On left side */}
      <button
        onClick={handleClose}
        className="absolute -top-1 -left-1 w-7 h-7 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors z-10 font-bold text-lg"
        aria-label="Cerrar Suru"
      >
        ×
      </button>

      {/* Minimize/Maximize button - On left side */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -top-1 -left-10 w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-cyan-600 transition-colors z-10 text-xs"
        aria-label={isMinimized ? 'Maximizar Suru' : 'Minimizar Suru'}
      >
        {isMinimized ? '↑' : '↓'}
      </button>

      {/* Suru Mascot - Responsive sizing */}
      <div className="relative transition-transform hover:scale-105 duration-300">
        <SuruMascot
          pose={pose}
          size={isMobile ? 'mini' : 'small'}
          animated
          message={currentMessage}
          onInteraction={handleInteraction}
          autoAnimate={false}
        />
      </div>

      {/* Pulsing ring when there's a new message */}
      {currentMessage && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-30" />
        </div>
      )}
    </div>
  );
}
