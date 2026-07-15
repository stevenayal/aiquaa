'use client';

import React from 'react';

interface LogoMarkProps {
  size?: number;
  color?: string;
  wordmark?: boolean;
  className?: string;
  animated?: boolean;
}

export default function LogoMark({
  size = 40,
  color = 'currentColor',
  wordmark = true,
  className,
  animated = false,
}: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={wordmark ? '0 0 240 280' : '0 0 240 160'}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', color }}
      role="img"
      aria-label="AIQUAA"
    >
      <g stroke={color} strokeWidth="6" fill="none" strokeLinecap="round">
        <g className={animated ? 'lm-orbit lm-orbit-1' : undefined}>
          <ellipse cx="120" cy="80" rx="70" ry="28" />
        </g>
        <g className={animated ? 'lm-orbit lm-orbit-2' : undefined}>
          <g transform="rotate(60 120 80)">
            <ellipse cx="120" cy="80" rx="70" ry="28" />
          </g>
        </g>
        <g className={animated ? 'lm-orbit lm-orbit-3' : undefined}>
          <g transform="rotate(120 120 80)">
            <ellipse cx="120" cy="80" rx="70" ry="28" />
          </g>
        </g>
      </g>
      <g fill={color}>
        <circle cx="120" cy="80" r="10" />
        <circle cx="55" cy="62" r="5" />
        <circle cx="185" cy="62" r="5" />
        <circle cx="68" cy="118" r="5" />
        <circle cx="172" cy="118" r="5" />
      </g>
      {wordmark && (
        <>
          <text
            x="120"
            y="200"
            fontFamily="Sora, system-ui, sans-serif"
            fontSize="56"
            fontWeight="800"
            fill={color}
            textAnchor="middle"
            letterSpacing="-1"
          >
            aiquaa
          </text>
          <text
            x="120"
            y="240"
            fontFamily="Sora, system-ui, sans-serif"
            fontSize="13"
            fontWeight="600"
            fill={color}
            textAnchor="middle"
            letterSpacing="3"
            opacity="0.85"
          >
            SABER ES CALIDAD
          </text>
        </>
      )}
    </svg>
  );
}
