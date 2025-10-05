import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
// import { ProfilingIntegration } from '@sentry/profiling-node';

@Injectable()
export class SentryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    if (!dsn) {
      console.log('Sentry DSN not configured, skipping Sentry initialization');
      return;
    }

    Sentry.init({
      dsn,
      environment,
      integrations: [
        // Profiling disabled temporarily due to Node.js v22 compatibility issues
        // new ProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Profiling
      // profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Enable debug in development
      debug: environment === 'development',
    });

    console.log('Sentry initialized');
  }

  captureException(exception: Error, context?: Record<string, any>) {
    if (Sentry.getCurrentHub().getClient()) {
      Sentry.captureException(exception, {
        extra: context,
      });
    }
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
    if (Sentry.getCurrentHub().getClient()) {
      Sentry.captureMessage(message, {
        level,
        extra: context,
      });
    }
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    if (Sentry.getCurrentHub().getClient()) {
      Sentry.setUser(user);
    }
  }

  setTag(key: string, value: string) {
    if (Sentry.getCurrentHub().getClient()) {
      Sentry.setTag(key, value);
    }
  }
}
