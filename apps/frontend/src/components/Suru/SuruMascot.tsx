'use client';

import { useEffect, useRef, useState } from 'react';

export type SuruPose =
  | 'welcome'
  | 'logo'
  | 'avatar'
  | 'chibi'
  | 'explaining'
  | 'checklist'
  | 'teacher'
  | 'automator'
  | 'explorer'
  | 'performance'
  | 'loading'
  | 'success'
  | '404'
  | 'error'
  | 'thinking'
  | 'happy'
  | 'working'
  | 'celebration'
  | 'sleeping'
  | 'confused';

export type SuruSize = 'mini' | 'small' | 'medium' | 'large' | 'hero';

interface SuruMascotProps {
  pose?: SuruPose;
  size?: SuruSize;
  animated?: boolean;
  className?: string;
  message?: string;
  onInteraction?: () => void;
  autoAnimate?: boolean;
}

const sizeMap: Record<SuruSize, number> = {
  mini: 64,
  small: 128,
  medium: 256,
  large: 512,
  hero: 1024,
};

export default function SuruMascot({
  pose = 'welcome',
  size = 'medium',
  animated = false,
  className = '',
  message,
  onInteraction,
  autoAnimate = true,
}: SuruMascotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pixelSize = sizeMap[size];

  // Auto-show message on mount if provided
  useEffect(() => {
    if (message && autoAnimate) {
      const timer = setTimeout(() => setShowMessage(true), 500);
      return () => clearTimeout(timer);
    }
  }, [message, autoAnimate]);

  // Handle click interaction
  const handleClick = () => {
    if (onInteraction) {
      onInteraction();
    }
    if (message && !showMessage) {
      setShowMessage(true);
    }
  };

  // Animation classes based on state
  const animationClasses = animated
    ? 'transition-transform duration-300 ease-in-out hover:scale-110 hover:-translate-y-2'
    : '';

  const interactiveClasses = onInteraction
    ? 'cursor-pointer active:scale-95'
    : '';

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Suru Image */}
      <div
        className={`relative ${animationClasses} ${interactiveClasses}`}
        style={{
          width: pixelSize,
          height: pixelSize,
        }}
      >
        {/* Using img tag for SVG support */}
        <img
          src={`/images/suru/suru-${pose}.svg`}
          alt={`Suru - ${pose}`}
          width={pixelSize}
          height={pixelSize}
          className="w-full h-full object-contain"
          loading={size === 'hero' ? 'eager' : 'lazy'}
        />

        {/* Hover glow effect */}
        {isHovered && animated && (
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
        )}
      </div>

      {/* Message Bubble */}
      {message && showMessage && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 animate-fade-in-up"
          style={{
            minWidth: pixelSize * 1.5,
            maxWidth: pixelSize * 2,
          }}
        >
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 border-2 border-cyan-500">
            <p className="text-sm md:text-base text-slate-800 dark:text-white font-medium text-center">
              {message}
            </p>

            {/* Bubble tail */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-cyan-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-[1px]">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white dark:border-t-slate-800" />
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMessage(false);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading spinner overlay (for 'loading' pose) */}
      {pose === 'loading' && animated && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
