'use client';

import React, { useEffect, useId, useState } from 'react';

interface LogoMarkProps {
  size?: number;
  color?: string;
  wordmark?: boolean;
  className?: string;
  animated?: boolean;
}

// Elipse cx=120 cy=80 rx=70 ry=28 trazada como dos arcos, para que
// animateMotion pueda recorrerla como un path.
const ORBIT_PATH_D = 'M 190 80 A 70 28 0 1 1 50 80 A 70 28 0 1 1 190 80';

// keyTimes 0/0.5 = costados (profundidad media), 0.25 = frente
// (más grande/opaco), 0.75 = fondo (más chico/tenue) — simula 3D.
const DEPTH_KEY_TIMES = '0;0.25;0.5;0.75;1';
const DEPTH_R_VALUES = '6;8;6;3.5;6';
const DEPTH_OPACITY_VALUES = '0.85;1;0.85;0.4;0.85';

function OrbitElectron({
  pathId,
  color,
  duration,
  begin = 0,
}: {
  pathId: string;
  color: string;
  duration: number;
  begin?: number;
}) {
  return (
    <>
      <path id={pathId} d={ORBIT_PATH_D} fill="none" stroke="none" />
      <circle r="6" fill={color} stroke="#000" strokeWidth="2">
        <animateMotion
          dur={`${duration}s`}
          begin={`${begin}s`}
          repeatCount="indefinite"
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
        <animate
          attributeName="r"
          values={DEPTH_R_VALUES}
          keyTimes={DEPTH_KEY_TIMES}
          dur={`${duration}s`}
          begin={`${begin}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values={DEPTH_OPACITY_VALUES}
          keyTimes={DEPTH_KEY_TIMES}
          dur={`${duration}s`}
          begin={`${begin}s`}
          repeatCount="indefinite"
        />
      </circle>
    </>
  );
}

export default function LogoMark({
  size = 40,
  color = 'currentColor',
  wordmark = true,
  className,
  animated = false,
}: LogoMarkProps) {
  const uid = useId();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const electronsOrbit = animated && !reduceMotion;

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
          {electronsOrbit ? (
            <OrbitElectron
              pathId={`lm-orbit-path-1-${uid}`}
              color={color}
              duration={4.5}
            />
          ) : (
            <circle
              cx="56.6"
              cy="68.2"
              r="6"
              fill={color}
              stroke="#000"
              strokeWidth="2"
            />
          )}
        </g>
        <g className={animated ? 'lm-orbit lm-orbit-2' : undefined}>
          <g transform="rotate(60 120 80)">
            <ellipse cx="120" cy="80" rx="70" ry="28" />
            {electronsOrbit ? (
              <OrbitElectron
                pathId={`lm-orbit-path-2-${uid}`}
                color={color}
                duration={6}
              />
            ) : (
              <circle
                cx="71.9"
                cy="127.3"
                r="6"
                fill={color}
                stroke="#000"
                strokeWidth="2"
              />
            )}
          </g>
        </g>
        <g className={animated ? 'lm-orbit lm-orbit-3' : undefined}>
          <g transform="rotate(120 120 80)">
            <ellipse cx="120" cy="80" rx="70" ry="28" />
            {electronsOrbit ? (
              <OrbitElectron
                pathId={`lm-orbit-path-3-${uid}`}
                color={color}
                duration={7.5}
              />
            ) : (
              <circle
                cx="178.9"
                cy="106"
                r="6"
                fill={color}
                stroke="#000"
                strokeWidth="2"
              />
            )}
          </g>
        </g>
      </g>
      <g fill={color}>
        <circle cx="120" cy="80" r="10" />
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
