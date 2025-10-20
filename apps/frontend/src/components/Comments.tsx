'use client';

import { useEffect, useRef } from 'react';

/**
 * Giscus Comments Component
 *
 * Before deployment, replace the following values:
 * - data-repo: Your GitHub repository (e.g., "username/repo")
 * - data-repo-id: Your repository ID (get from Giscus config)
 * - data-category: Discussion category name (e.g., "Comentarios")
 * - data-category-id: Category ID (get from Giscus config)
 *
 * To get these values:
 * 1. Visit https://giscus.app
 * 2. Enter your repository name
 * 3. Choose category for discussions
 * 4. Copy the generated script values
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
    script.setAttribute('data-repo', 'TODO:org/repo'); // TODO: Replace with your repo
    script.setAttribute('data-repo-id', 'TODO:R_xxxxx'); // TODO: Replace with your repo ID
    script.setAttribute('data-category', 'Comentarios'); // TODO: Replace with your category
    script.setAttribute('data-category-id', 'TODO:DIC_xxxxx'); // TODO: Replace with your category ID
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
