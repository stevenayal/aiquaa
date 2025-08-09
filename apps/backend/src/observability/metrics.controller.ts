import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrometheusController } from 'nestjs-prom';

@Controller('metrics')
export class MetricsController extends PrometheusController {
  @Get()
  async getMetrics(@Res() res: Response) {
    // Add custom metrics
    const customMetrics = await this.getCustomMetrics();
    
    // Get default metrics
    const defaultMetrics = await this.getDefaultMetrics();
    
    // Combine metrics
    const allMetrics = defaultMetrics + customMetrics;
    
    res.set('Content-Type', 'text/plain');
    res.send(allMetrics);
  }

  private async getCustomMetrics(): Promise<string> {
    const timestamp = Date.now();
    return `# HELP aiquaa_app_info Application information
# TYPE aiquaa_app_info gauge
aiquaa_app_info{version="1.0.0",environment="${process.env.NODE_ENV || 'development'}"} 1 ${timestamp}
`;
  }
}
