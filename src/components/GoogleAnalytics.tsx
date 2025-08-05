import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SEO_CONFIG } from '../config/seo';

// Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = SEO_CONFIG.analytics.googleAnalytics.measurementId;

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Inicializar Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Script de Google Analytics
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.gtag) {
      // Cargar el script de Google Analytics
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}');
      `;
      document.head.appendChild(script2);
    }
  }, []);

  return null;
};

export default GoogleAnalytics; 