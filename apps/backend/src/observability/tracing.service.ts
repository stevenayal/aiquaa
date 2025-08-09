import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

@Injectable()
export class TracingService implements OnModuleInit, OnModuleDestroy {
  private sdk: NodeSDK;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const otlpEndpoint = this.configService.get<string>('OTLP_ENDPOINT');
    const serviceName = this.configService.get<string>('SERVICE_NAME', 'aiquaa-backend');
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    if (!otlpEndpoint && environment === 'production') {
      console.warn('OTLP_ENDPOINT not configured, tracing will not be exported');
      return;
    }

    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
    });

    const traceExporter = otlpEndpoint
      ? new OTLPTraceExporter({
          url: `${otlpEndpoint}/v1/traces`,
        })
      : undefined;

    this.sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    // Initialize the SDK and register with the OpenTelemetry API
    // this enables the API to record telemetry
    await this.sdk.start();
    console.log('OpenTelemetry tracing initialized');
  }

  async onModuleDestroy() {
    if (this.sdk) {
      await this.sdk.shutdown();
      console.log('OpenTelemetry tracing shut down');
    }
  }
}
