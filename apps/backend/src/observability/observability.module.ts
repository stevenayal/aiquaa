import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusModule } from 'nestjs-prom';
import { TracingService } from './tracing.service';
import { MetricsController } from './metrics.controller';
import { SentryService } from './sentry.service';

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get('LOG_LEVEL', 'info'),
          transport: process.env.NODE_ENV === 'development' ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              levelFirst: true,
              translateTime: 'yyyy-mm-dd HH:MM:ss',
              ignore: 'pid,hostname',
            },
          } : undefined,
          customProps: (req, res) => ({
            context: 'HTTP',
            requestId: req.headers['x-request-id'] || req.id,
          }),
          customLogLevel: (req, res, err) => {
            if (res.statusCode >= 400 && res.statusCode < 500) {
              return 'warn';
            }
            if (res.statusCode >= 500 || err) {
              return 'error';
            }
            return 'silent';
          },
          customSuccessMessage: (req, res) => {
            return `${req.method} ${req.url} - ${res.statusCode}`;
          },
          customErrorMessage: (req, res, err) => {
            return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
          },
          customAttributeKeys: {
            req: 'request',
            res: 'response',
            err: 'error',
            responseTime: 'response_time',
          },
          serializers: {
            req: (req) => ({
              method: req.method,
              url: req.url,
              headers: req.headers,
            }),
            res: (res) => ({
              statusCode: res.statusCode,
            }),
          },
        },
      }),
      inject: [ConfigService],
    }),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'aiquaa_',
        },
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [TracingService, SentryService],
  exports: [LoggerModule, PrometheusModule, TracingService, SentryService],
})
export class ObservabilityModule {}
