'use client';

import { useEffect } from 'react';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private static instance: Analytics;
  private isEnabled: boolean = process.env.NODE_ENV === 'production';

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) {
      // En desarrollo, solo loguear el evento
      console.log('Analytics Event:', { event, properties, timestamp: Date.now() });
      return;
    }

    // En producción, enviar a endpoint de analytics
    this.sendEvent({ event, properties, timestamp: Date.now() });
  }

  private async sendEvent(analyticsEvent: AnalyticsEvent) {
    try {
      const response = await fetch('/api/analytics/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsEvent),
      });

      if (!response.ok) {
        console.error('Failed to send analytics event:', analyticsEvent);
      }
    } catch (error) {
      console.error('Error sending analytics event:', error);
    }
  }
}

export const useAnalytics = () => {
  const analytics = Analytics.getInstance();

  const trackEvent = (event: string, properties?: Record<string, any>) => {
    analytics.track(event, properties);
  };

  return { trackEvent };
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialize analytics on app load
    const analytics = Analytics.getInstance();
    analytics.track('app_loaded', {
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
  }, []);

  return <>{children}</>;
};
