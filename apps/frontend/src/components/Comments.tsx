'use client';

import { useEffect, useRef } from 'react';

/**
 * Giscus Comments Component
 *
 * Configured for: stevenayal/aiquaa
 * Category: General (GitHub Discussions)
 * Theme: Adapts to dark/light mode automatically
 * Language: Spanish (es)
 */

export default function Comments() {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load Giscus on client side
    if (!commentsRef.current) return;

    // Check if script already exists
    const existingScript = commentsRef.current.querySelector('script[src*="giscus"]');
    if (existingScript) return;

    // Create Giscus script
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'stevenayal/aiquaa');
    script.setAttribute('data-repo-id', 'R_kgDOPXtSEg');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOPXtSEs4Cw1_0');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'es');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    commentsRef.current.appendChild(script);

    // Cleanup function
    return () => {
      const container = commentsRef.current;
      if (container) {
        // Remove Giscus iframe and script
        const giscusFrame = container.querySelector('.giscus-frame');
        if (giscusFrame) {
          giscusFrame.remove();
        }
        const giscusScript = container.querySelector('script[src*="giscus"]');
        if (giscusScript) {
          giscusScript.remove();
        }
      }
    };
  }, []);

  return (
    <div
      ref={commentsRef}
      className="giscus-container w-full"
      aria-label="Comentarios con Giscus"
    />
  );
}
