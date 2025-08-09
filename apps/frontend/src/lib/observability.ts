import * as Sentry from '@sentry/react';

// Initialize Sentry if DSN is available
export function initializeSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  if (!dsn) {
    console.log('Sentry DSN not configured, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
  });

  console.log('Sentry initialized for frontend');
}

// Generate request ID for correlation
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Enhanced fetch with request ID and error handling
export async function fetchWithObservability(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const requestId = generateRequestId();
  
  // Add request ID to headers
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'X-Request-Id': requestId,
    },
  };

  try {
    const response = await fetch(url, enhancedOptions);
    
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] ${options.method || 'GET'} ${url} - ${response.status}`);
    }

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      (error as any).requestId = requestId;
      
      // Capture error in Sentry
      if (Sentry.getCurrentHub().getClient()) {
        Sentry.captureException(error, {
          extra: {
            url,
            method: options.method || 'GET',
            status: response.status,
            requestId,
          },
        });
      }
      
      throw error;
    }

    return response;
  } catch (error) {
    // Capture network errors in Sentry
    if (Sentry.getCurrentHub().getClient()) {
      Sentry.captureException(error, {
        extra: {
          url,
          method: options.method || 'GET',
          requestId,
        },
      });
    }
    
    throw error;
  }
}

// Utility to capture user actions
export function captureUserAction(action: string, properties?: Record<string, any>) {
  if (Sentry.getCurrentHub().getClient()) {
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: action,
      data: properties,
      level: 'info',
    });
  }
}

// Utility to set user context
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  if (Sentry.getCurrentHub().getClient()) {
    Sentry.setUser(user);
  }
}
